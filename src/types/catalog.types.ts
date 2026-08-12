export interface Categorie {
  id: number;
  nom: string;
  description: string | null;
}

export interface Article {
  id: number;
  reference: string | null;
  nom: string;
  description: string | null;
  prixVente: number;
  coutAchat?: number; // présent uniquement pour un GERANT
  marge?: number; // présent uniquement pour un GERANT
  quantiteStock: number;
  seuilAlerte?: number;
  stockBas?: boolean;
  imageUrl: string | null;
  actif: boolean;
  categorie: Categorie;
}

export interface CategorieRequest {
  nom: string;
  description: string | null;
}

export interface ArticleCreateRequest {
  reference: string | null;
  nom: string;
  description: string | null;
  prixVente: number;
  coutAchat: number;
  quantiteStock: number;
  seuilAlerte: number | null;
  imageUrl: string | null;
  categorieId: number;
}

export interface ArticleUpdateRequest extends ArticleCreateRequest {
  actif: boolean;
}