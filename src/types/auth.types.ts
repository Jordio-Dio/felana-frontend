export type Role = "GERANT" | "VENDEUR";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterVendeurRequest {
  nom: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  username: string;
  role: Role;
  tokenType: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

/**
 * Représente l'utilisateur connecté tel que stocké côté frontend (dérivé
 * de AuthResponse). Ne contient jamais le mot de passe, évidemment.
 */
export interface AuthenticatedUser {
  nom: string;
  email: string;
  role: Role;
}