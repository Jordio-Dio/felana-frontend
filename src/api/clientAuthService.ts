import { axiosInstance } from "@/api/axiosInstance";
import type {
  ClientAuthResponse,
  ClientLoginRequest,
  ClientRegisterRequest,
  AuthenticatedClient,
  ClientProfile,
  UpdateClientProfileRequest,
  ChangePasswordRequest,
} from "@/types/clientAuth.types";

const CLIENT_TOKEN_KEY = "felana_client_token";
const LEGACY_CLIENT_TOKEN_KEY = "token";
const CLIENT_USER_KEY = "felana_client_user";

function getClientTokenFromAuth(auth: ClientAuthResponse): string | null {
  return auth.token ?? auth.accessToken ?? null;
}

function persistClientToken(token?: string | null) {
  if (!token) return;

  localStorage.setItem(CLIENT_TOKEN_KEY, token);
  localStorage.setItem(LEGACY_CLIENT_TOKEN_KEY, token);
}

function clearClientToken() {
  localStorage.removeItem(CLIENT_TOKEN_KEY);
  localStorage.removeItem(LEGACY_CLIENT_TOKEN_KEY);
}

export const clientAuthService = {
  async register(payload: ClientRegisterRequest): Promise<ClientAuthResponse> {
    const { data, status } = await axiosInstance.post<ClientAuthResponse>(
      "/v1/public/client/register",
      payload
    );

    if (status !== 200 && status !== 201) {
      throw new Error("Inscription client invalide.");
    }

    const token = getClientTokenFromAuth(data);
    if (!token || !token.trim()) {
      throw new Error("Token client absent après inscription.");
    }

    persistClientToken(token);
    return data;
  },

  async login(payload: ClientLoginRequest): Promise<ClientAuthResponse> {
    const { data, status } = await axiosInstance.post<ClientAuthResponse>(
      "/v1/public/client/login",
      payload
    );

    if (status !== 200 && status !== 201) {
      throw new Error("Connexion client invalide.");
    }

    const token = getClientTokenFromAuth(data);
    if (!token || !token.trim()) {
      throw new Error("Token client absent après connexion.");
    }

    persistClientToken(token);
    return data;
  },

  saveSession(auth: ClientAuthResponse): AuthenticatedClient {
    const token = getClientTokenFromAuth(auth);
    persistClientToken(token);

    const client: AuthenticatedClient = {
      clientId: auth.clientId ?? auth.id ?? 0,
      nom: auth.nom,
      prenom: auth.prenom || null,
      telephone: auth.telephone ?? "",
      adresse: auth.adresse || null,
    };

    localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(client));
    return client;
  },

  getStoredClient(): AuthenticatedClient | null {
    const raw = localStorage.getItem(CLIENT_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthenticatedClient) : null;
  },

  getToken(): string | null {
    return localStorage.getItem(CLIENT_TOKEN_KEY) ?? localStorage.getItem(LEGACY_CLIENT_TOKEN_KEY);
  },

  logout(): void {
    clearClientToken();
    localStorage.removeItem(CLIENT_USER_KEY);
  },

  async getProfile(): Promise<ClientProfile> {
    const { data } = await axiosInstance.get<ClientProfile>("/v1/public/client/me");
    return data;
  },

  async updateProfile(payload: UpdateClientProfileRequest): Promise<ClientAuthResponse> {
    const { data } = await axiosInstance.patch<ClientAuthResponse>("/v1/public/client/me", payload);
    if (data.accessToken) {
      persistClientToken(data.accessToken);
    }
    return data;
  },

  async changePassword(payload: ChangePasswordRequest): Promise<ClientAuthResponse> {
    const { data } = await axiosInstance.patch<ClientAuthResponse>("/v1/public/client/me/password", payload);
    if (data.accessToken) {
      persistClientToken(data.accessToken);
    }
    return data;
  },
};

export { CLIENT_TOKEN_KEY };