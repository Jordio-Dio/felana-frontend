export interface ClientRegisterRequest {
  nom: string;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  password: string;
}

export interface ClientLoginRequest {
  identifiant: string;
  password: string;
}

export interface ClientAuthResponse {
  clientId: number;
  accessToken: string;
  nom: string;
  emailVerifie: boolean;
}

/** Profil client retourné par GET /v1/public/client/me */
export interface ClientProfile {
  id: number;
  nom: string;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
}

/** Pour PATCH /v1/public/client/me (mise à jour du profil client). */
export interface UpdateClientProfileRequest {
  nom: string;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
}

/** Pour POST /v1/public/client/me/change-password. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthenticatedClient {
  clientId: number;
  nom: string;
  emailVerifie: boolean;
  prenom: string | null;
  telephone: string | null;
  adresse: string | null;
}