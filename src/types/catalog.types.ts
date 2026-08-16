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
  coutMatiere?: number; // présent uniquement pour un GERANT
  coutAccessoire?: number; // présent uniquement pour un GERANT
  coutMainOeuvre?: number; // présent uniquement pour un GERANT
  coutAchat?: number; // calculé côté serveur, présent uniquement pour un GERANT
  pourcentageMarge?: number | null; // présent uniquement pour un GERANT
  prixVenteSuggere?: number | null; // présent uniquement pour un GERANT
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
  coutMatiere: number;
  coutAccessoire: number;
  coutMainOeuvre: number;
  pourcentageMarge: number | null;
  quantiteStock: number;
  seuilAlerte: number | null;
  imageUrl: string | null;
  categorieId: number;
}

export interface ArticleUpdateRequest extends ArticleCreateRequest {
  actif: boolean;
}