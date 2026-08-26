import type { StatutCommande } from "@/types/orders.types";

export const STATUT_TONES: Record<StatutCommande, "rose" | "pink" | "amber" | "gray" | "red"> = {
  EN_ATTENTE: "amber",
  EN_ATTENTE_VALIDATION: "pink",
  EN_FABRICATION: "gray",
  PAYEE: "rose",
  LIVREE: "rose",
  ANNULEE: "red",
};