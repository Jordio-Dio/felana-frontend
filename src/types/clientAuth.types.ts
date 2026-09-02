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

export interface AuthenticatedClient {
  clientId: number;
  nom: string;
  emailVerifie: boolean;
}