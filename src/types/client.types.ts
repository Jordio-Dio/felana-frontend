import type { Client } from "@/types/orders.types";

export type { Client };

// 1. Pour la création / modification du profil d'un client (Admin ou Client)
export interface ClientRequest {
  nom: string;
  prenom?: string | null;      // Optionnel
  telephone: string;           // Requis et unique
  adresse?: string | null;
}

// 2. Inscription d'un client (avec mot de passe)
export interface ClientRegisterRequest {
  nom: string;
  prenom?: string | null;
  telephone: string;
  password?: string;
}

// 3. Connexion par téléphone
export interface ClientLoginRequest {
  identifiant: string;         // Numéro de téléphone
  password?: string;
}

// 4. Commande Invité (Guest Order) lors du checkout
export interface GuestOrderRequest {
  nom: string;
  prenom?: string | null;
  telephone: string;
  adresse: string;
  items: {
    articleId: number;
    quantite: number;
    prixUnitaire: number;
  }[];
}

// 5. Réponse d'authentification après Login / Register
export interface ClientAuthResponse {
  id: number;
  token: string;
  nom: string;
}