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

/** Infos publiques de la boutique (GET /v1/public/shop-info). */
export interface ShopInfo {
  nom: string;
  adresse: string;
  telephone: string;
  mvolaNumero: string;
  airtelMoneyNumero: string;
  orangeMoneyNumero: string;
  email: string;
  whatsapp: string;
  nifStat: string;
}

export interface PublicOrderItemRequest {
  articleId: number;
  quantite: number;
}

export interface ClientInfo {
  nom: string;
  telephone: string;
  adresse?: string;
}

export interface PublicOrderRequest {
  nomClient: string;
  telephone: string;
  adresseLivraison: string;
  modePaiement: ModePaiement;
  items: PublicOrderItemRequest[];

}

export interface PublicOrderResponse {
  reference: string;
  totalAchat: number;
  modePaiement: string;
  instructionsPaiement: string;
}