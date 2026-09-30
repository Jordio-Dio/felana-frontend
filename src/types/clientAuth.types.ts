export interface ClientRegisterRequest {
  nom: string;
  prenom?: string | null;
  telephone: string;
  password?: string;
}

export interface ClientLoginRequest {
  identifiant: string; // Numéro de téléphone
  password?: string;
}

export interface ClientAuthResponse {
  id?: number;
  clientId?: number;
  token?: string;
  accessToken?: string;
  nom: string;
  prenom?: string | null;
  telephone?: string;
  adresse?: string | null;
}

/** Profil client retourné par GET /v1/public/client/me */
export interface ClientProfile {
  id: number;
  nom: string;
  prenom?: string | null;
  telephone: string;
  adresse?: string | null;
}

/** Pour PATCH /v1/public/client/me (mise à jour du profil client). */
export interface UpdateClientProfileRequest {
  nom: string;
  prenom?: string | null;
  telephone: string;
  adresse?: string | null;
}

/** Pour PATCH /v1/public/client/me/password. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthenticatedClient {
  clientId: number;
  nom: string;
  prenom?: string | null;
  telephone: string;
  adresse?: string | null;
}