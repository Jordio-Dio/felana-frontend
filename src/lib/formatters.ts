export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MGA",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYEE: "Payée",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

export const STATUT_BADGE_CLASSES: Record<string, string> = {
  EN_ATTENTE: "bg-amber-50 text-amber-700 border-amber-200",
  PAYEE: "bg-teal-50 text-teal-700 border-teal-200",
  LIVREE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ANNULEE: "bg-red-50 text-red-700 border-red-200",
};