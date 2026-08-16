export type StatutCommande = "EN_ATTENTE" | "EN_FABRICATION" | "PAYEE" | "LIVREE" | "ANNULEE";

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
  dateCommande: string;
  statut: StatutCommande;
  client: Client;
  vendeurNom: string;
  remise: number;
  totalAchat: number;
  lignes: LigneCommande[];
}

export interface LigneCommandeRequest {
  articleId: number;
  quantite: number;
}

export interface CommandeCreateRequest {
  clientId: number;
  lignes: LigneCommandeRequest[];
  remise: number | null;
}

export interface StatutUpdateRequest {
  statut: StatutCommande;
}

export interface InvoiceLigne {
  reference: string | null;
  articleNom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface Invoice {
  numeroFacture: string;
  dateEmission: string;
  magasinNom: string;
  magasinAdresse: string;
  magasinTelephone: string;
  clientNomComplet: string;
  clientTelephone: string | null;
  clientEmail: string | null;
  vendeurNom: string;
  lignes: InvoiceLigne[];
  sousTotal: number;
  remise: number;
  tauxTaxe: number;
  montantTaxe: number;
  total: number;
  statutPaiement: StatutCommande;
}