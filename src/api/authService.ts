import { axiosInstance, STORAGE_KEYS } from "@/api/axiosInstance";
import type {
  AuthResponse,
  AuthenticatedUser,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterVendeurRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "@/types/auth.types";

/**
 * Toutes les fonctions ci-dessous retournent des Promises brutes ; c'est
 * AuthContext (Étape 3) qui orchestrera l'appel + la mise à jour de l'état
 * React + la persistance en localStorage. Ce service reste "pur réseau",
 * sans aucune dépendance à React.
 */
export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async registerVendeur(payload: RegisterVendeurRequest): Promise<void> {
    await axiosInstance.post("/auth/register-vendeur", payload);
  },

  async verifyEmail(payload: VerifyEmailRequest): Promise<void> {
    await axiosInstance.post("/auth/verify-email", payload);
  },

  async resendVerification(email: string): Promise<void> {
    await axiosInstance.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`);
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await axiosInstance.post("/auth/forgot-password", payload);
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await axiosInstance.post("/auth/reset-password", payload);
  },

  /** Persiste la session en localStorage après un login réussi. */
  saveSession(auth: AuthResponse): AuthenticatedUser {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, auth.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, auth.refreshToken);

    const user: AuthenticatedUser = {
      nom: auth.username,
      email: "", // l'email n'est pas renvoyé dans AuthResponse actuellement, voir note ci-dessous
      role: auth.role,
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  /** Relit l'utilisateur persisté (utile au rechargement de page). */
  getStoredUser(): AuthenticatedUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as AuthenticatedUser) : null;
  },

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};