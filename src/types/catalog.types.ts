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