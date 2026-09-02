import { axiosInstance } from "@/api/axiosInstance";
import type {
  ClientAuthResponse,
  ClientLoginRequest,
  ClientRegisterRequest,
  AuthenticatedClient,
} from "@/types/clientAuth.types";

const CLIENT_TOKEN_KEY = "felana_client_token";
const CLIENT_USER_KEY = "felana_client_user";

export const clientAuthService = {
  async register(payload: ClientRegisterRequest): Promise<ClientAuthResponse> {
    const { data } = await axiosInstance.post<ClientAuthResponse>(
      "/v1/public/client/register",
      payload
    );
    return data;
  },

  async login(payload: ClientLoginRequest): Promise<ClientAuthResponse> {
    const { data } = await axiosInstance.post<ClientAuthResponse>(
      "/v1/public/client/login",
      payload
    );
    return data;
  },

  saveSession(auth: ClientAuthResponse): AuthenticatedClient {
    localStorage.setItem(CLIENT_TOKEN_KEY, auth.accessToken);
    const client: AuthenticatedClient = {
      clientId: auth.clientId,
      nom: auth.nom,
      emailVerifie: auth.emailVerifie,
    };
    localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(client));
    return client;
  },

  getStoredClient(): AuthenticatedClient | null {
    const raw = localStorage.getItem(CLIENT_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthenticatedClient) : null;
  },

  getToken(): string | null {
    return localStorage.getItem(CLIENT_TOKEN_KEY);
  },

  logout(): void {
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    localStorage.removeItem(CLIENT_USER_KEY);
  },
};

export { CLIENT_TOKEN_KEY };