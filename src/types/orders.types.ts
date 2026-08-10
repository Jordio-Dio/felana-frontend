export type StatutCommande = "EN_ATTENTE" | "PAYEE" | "LIVREE" | "ANNULEE";

export interface Client {
  id: number;
  nom: string;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
}

export interface LigneCommande {
  id: number;
  articleId: number;
  articleNom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface Commande {
  id: number;
  reference: string;
  dateCommande: string; // ISO string
  statut: StatutCommande;
  client: Client;
  vendeurNom: string;
  totalAchat: number;
  lignes: LigneCommande[];
}