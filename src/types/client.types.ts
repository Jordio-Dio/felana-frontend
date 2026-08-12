import type { Client } from "@/types/orders.types";

export type { Client };

export interface ClientRequest {
  nom: string;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
}