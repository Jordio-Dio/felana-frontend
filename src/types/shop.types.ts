export interface ArticlePublic {
  id: number;
  reference: string | null;
  nom: string;
  description: string | null;
  prixVente: number;
  imageUrls: string[];
  disponible: boolean;
  categorieNom: string;
}

export type ModePaiement = "MVOLA_MANUEL" | "ORANGE_MONEY_MANUEL" | "ESPECES";

export interface PublicOrderItemRequest {
  articleId: number;
  quantite: number;
}

export interface PublicOrderRequest {
  modePaiement: ModePaiement;
  items: PublicOrderItemRequest[];
}

export interface PublicOrderResponse {
  reference: string;
  totalAchat: number;
  modePaiement: string;
  instructionsPaiement: string;
}