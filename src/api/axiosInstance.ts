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
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
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

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  window.location.href = "/login";
}