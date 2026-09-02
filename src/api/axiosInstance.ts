import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponse } from "@/types/auth.types";
import { notify } from "@/lib/toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Clés utilisées dans localStorage. Centralisées ici pour éviter les
 * fautes de frappe / incohérences ailleurs dans le code.
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "felana_access_token",
  REFRESH_TOKEN: "felana_refresh_token",
  USER: "felana_user",
} as const;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Intercepteur de requête : ajoute automatiquement le header
 * "Authorization: Bearer <token>" sur CHAQUE appel, sans avoir à le faire
 * manuellement dans chaque service. On exclut volontairement les routes
 * publiques (login, refresh) pour éviter d'envoyer un vieux token invalide
 * dessus par erreur.
 */
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const publicPaths = [
    "/auth/login",
    "/auth/refresh-token",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/v1/public/articles",
    "/v1/public/client/register",
    "/v1/public/client/login",
  ];
  const isPublic = publicPaths.some((path) => config.url?.includes(path));

  // Les routes protégées côté vitrine (commandes du client) utilisent le
  // token CLIENT, jamais le token staff - même si les deux sont présents
  // dans le même navigateur (ex: gérante qui teste aussi la boutique).
  const isClientRoute = config.url?.includes("/v1/public/orders") ||
    config.url?.includes("/v1/public/mes-commandes");

  if (isClientRoute) {
    const clientToken = localStorage.getItem("felana_client_token");
    if (clientToken) {
      config.headers.Authorization = `Bearer ${clientToken}`;
    }
  } else if (!isPublic) {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

/**
 * Empêche plusieurs refresh simultanés si plusieurs requêtes échouent en
 * même temps (ex: dashboard qui charge 4 endpoints en parallèle et
 * l'access token vient d'expirer) : on ne fait qu'UN SEUL appel refresh,
 * les autres attendent son résultat.
 */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

/**
 * Intercepteur de réponse : si une requête échoue avec 401 (access token
 * expiré) ET qu'on n'a pas déjà tenté un refresh pour CETTE requête,
 * on tente de rafraîchir le token puis on rejoue la requête originale.
 * Si le refresh échoue aussi -> déconnexion complète (tokens invalides).
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Ne jamais tenter de refresh sur l'appel de refresh lui-même (boucle infinie sinon).
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      
      // Un token client expiré ne peut pas être rafraîchi (pas de refresh token
      // pour les clients) - on le traite comme une session expirée classique.
      if (originalRequest.url?.includes("/v1/public/orders") || originalRequest.url?.includes("/v1/public/mes-commandes")) {
        localStorage.removeItem("felana_client_token");
        localStorage.removeItem("felana_client_user");
        window.location.href = "/shop/connexion";
        return Promise.reject(error);
      }
      clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Un refresh est déjà en cours : on attend son résultat avant de rejouer.
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error("Aucun refresh token disponible.");
      }

      const { data } = await axios.post<AuthResponse>(`${BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

      onRefreshed(data.accessToken);
      isRefreshing = false;

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      clearSession();
      return Promise.reject(refreshError);
    }
  }
);

/**
 * Purge complète de la session locale. Utilisée en cas d'échec du refresh
 * (session définitivement invalide) ou lors d'un logout explicite.
 * Redirige vers /login pour forcer une reconnexion.
 */
export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  window.location.href = "/login";
}



axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne pas doubler la notification si le composant appelant gère déjà
    // l'erreur lui-même (ex: formulaires avec message inline) - on ne
    // notifie ici que les erreurs réseau/serveur "silencieuses" (5xx, pas
    // de réponse du tout), pas les 400/401/403/404 qui sont déjà affichés
    // dans les formulaires.
    if (!error.response) {
      notify.error("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } else if (error.response.status >= 500) {
      notify.error("Une erreur serveur est survenue. Réessayez plus tard.");
    }
    return Promise.reject(error);
  }
);