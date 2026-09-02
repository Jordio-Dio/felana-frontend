import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponse } from "@/types/auth.types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
 * Intercepteur de requête : injecte le token staff ou le token client
 */
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // ⚠️ FIX : On liste précisément les routes publiques au lieu d'utiliser "/v1/public"
  // pour éviter de bloquer l'envoi du token sur /v1/public/orders !
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

  const isClientRoute =
    config.url?.includes("/v1/public/orders") ||
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
 * Intercepteur de réponse : gère le refresh token staff et la déconnexion client
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // ⚠️ FIX : Traitement des 401 sur les routes client (placé AU DEBUT pour éviter les boucles)
    if (
      originalRequest.url?.includes("/v1/public/orders") ||
      originalRequest.url?.includes("/v1/public/mes-commandes")
    ) {
      localStorage.removeItem("felana_client_token");
      localStorage.removeItem("felana_client_user");
      window.location.href = "/shop/connexion";
      return Promise.reject(error);
    }

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