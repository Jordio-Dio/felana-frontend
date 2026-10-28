import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponse } from "@/types/auth.types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "felana_access_token",
  REFRESH_TOKEN: "felana_refresh_token",
  USER: "felana_user",
  CLIENT_TOKEN: "felana_client_token",
  CLIENT_USER: "felana_client_user",
} as const;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Intercepteur de requête : injecte le token staff ou le token client
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

  if (config.url?.includes("/v1/public/")) {
    const clientToken =
      localStorage.getItem(STORAGE_KEYS.CLIENT_TOKEN) ?? localStorage.getItem("token");

    // Sécurité supplémentaire : s'assurer que le token est valide avant d'injecter l'en-tête
    if (clientToken && clientToken !== "null" && clientToken !== "undefined" && !isPublic) {
      config.headers.Authorization = `Bearer ${clientToken}`;
    }
  } else if (!isPublic) {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

let isRefreshing = false;
type RefreshSubscriber = {
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
};
let refreshSubscribers: RefreshSubscriber[] = [];

function subscribeTokenRefresh(resolve: RefreshSubscriber["resolve"], reject: RefreshSubscriber["reject"]) {
  refreshSubscribers.push({ resolve, reject });
}

function flushSubscribers(run: (subscriber: RefreshSubscriber) => void) {
  const pending = refreshSubscribers;
  refreshSubscribers = [];
  pending.forEach(run);
}

/** Un access token exploitable : présent, non vide, non expiré. */
function isUsableAccess(value: string | null): value is string {
  return !!value && value !== "null" && value !== "undefined" && !isTokenExpired(value);
}

/** Un refresh token exploitable : c'est un UUID opaque, PAS un JWT. */
function isUsableRefresh(value: string | null): value is string {
  return !!value && value !== "null" && value !== "undefined";
}

/**
 * Décode l'expiration d'un JWT sans en vérifier la signature : suffisant pour
 * décider si un rafraîchissement est nécessaire avant d'émettre un appel.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof claims.exp !== "number") return false;
    return Date.now() >= claims.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Refus EXPLICITE du serveur (401/403 sur le refresh) : à ce stade la session
 * est réellement morte. Seule cette erreur autorise une déconnexion.
 */
export class SessionExpiredError extends Error {
  constructor(message = "Session expirée.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

const REFRESH_LOCK_KEY = "felana_refresh_lock";
const REFRESH_LOCK_TTL_MS = 10_000;

function acquireRefreshLock(): boolean {
  try {
    const heldAt = Number(localStorage.getItem(REFRESH_LOCK_KEY) ?? 0);
    if (heldAt && Date.now() - heldAt < REFRESH_LOCK_TTL_MS) return false;
    localStorage.setItem(REFRESH_LOCK_KEY, String(Date.now()));
    return true;
  } catch {
    return true; // stockage inaccessible : on tente quand même
  }
}

function releaseRefreshLock() {
  try {
    localStorage.removeItem(REFRESH_LOCK_KEY);
  } catch {
    /* rien à faire */
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Échange le refresh token contre un nouvel access token.
 *
 * Garde-fous, pour ne JAMAIS déconnecter une session qui est encore bonne :
 *  1. si le token en stockage est déjà valide (un autre onglet a rafraîchi
 *     entre-temps), on le réutilise sans appel réseau ni rotation supplémentaire ;
 *  2. un verrou partagé entre onglets sérialise les rafraîchissements réels,
 *     ce qui évite d'envoyer deux fois le même refresh token ;
 *  3. seuls les refus du serveur (401/403) lèvent SessionExpiredError. Une
 *     coupure réseau ou une 5xx est propagée telle quelle : on ne détruit pas
 *     la session parce que le serveur a eu un raté.
 */
export async function refreshAccessToken(): Promise<string> {
  const storedAccess = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (isUsableAccess(storedAccess)) {
    return storedAccess;
  }

  let holdsLock = acquireRefreshLock();
  for (let attempt = 0; !holdsLock && attempt < 10; attempt++) {
    await wait(200);
    holdsLock = acquireRefreshLock();
  }

  try {
    // Re-vérification après le verrou : un autre onglet a pu écrire entre-temps.
    const current = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (isUsableAccess(current)) {
      return current;
    }

    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!isUsableRefresh(refreshToken)) {
      throw new SessionExpiredError("Aucun refresh token disponible.");
    }

    try {
      const { data } = await axios.post<AuthResponse>(`${BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      return data.accessToken;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) {
        throw new SessionExpiredError("Session expirée ou révoquée.");
      }
      throw error;
    }
  } finally {
    if (holdsLock) releaseRefreshLock();
  }
}

/**
 * Intercepteur de réponse : gère le refresh token staff et les erreurs d'authentification
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 403) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 1. CORRECTION MAJEURE : Si le 401 provient d'une tentative de CONNEXION (login)
    // On rejette immédiatement l'erreur SANS chercher à rafraîchir ni rediriger.
    const isLoginEndpoint = 
      originalRequest.url?.includes("/auth/login") || 
      originalRequest.url?.includes("/v1/public/client/login");

    if (isLoginEndpoint) {
      return Promise.reject(error);
    }

    // 2. Gestion spécifique de l'espace client
    if (originalRequest.url?.includes("/v1/public/")) {
      localStorage.removeItem(STORAGE_KEYS.CLIENT_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CLIENT_USER);
      
      // Si la requête client échouée concerne les commandes ou le profil client, rediriger vers la boutique
      if (originalRequest.url?.includes("/v1/public/mes-commandes") || originalRequest.url?.includes("/v1/public/client/me")) {
        window.location.href = "/shop/connexion";
      }
      return Promise.reject(error);
    }

    // 3. Si c'est l'appel refresh-token lui-même qui renvoie 401 -> déconnexion staff
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          },
          reject
        );
      });
    }

    isRefreshing = true;

    try {
      const accessToken = await refreshAccessToken();
      flushSubscribers((subscriber) => subscriber.resolve(accessToken));
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Les requêtes en attente doivent être terminées : sinon elles restent
      // suspendues à jamais et gardent un callback périmé en mémoire.
      flushSubscribers((subscriber) => subscriber.reject(refreshError));

      // Déconnexion UNIQUEMENT sur refus explicite du serveur. Une erreur
      // réseau, un 500 ou un serveur qui redémarre ne détruit pas la session :
      // c'est précisément ce qui renvoyait la gérante au login à chaque fois.
      if (refreshError instanceof SessionExpiredError) {
        clearSession();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  window.location.href = "/login";
}