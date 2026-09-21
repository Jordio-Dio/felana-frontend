import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Tendance optionnelle (ex: +12.5%, -3%) */
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  isLoading?: boolean;
}

/**
 * Calcule la classe de taille de texte en fonction de la longueur du montant
 */
function getValueFontSize(val: string): string {
  const len = val.length;
  if (len > 15) return "text-sm sm:text-base";     // Montant très long / MGA élevé
  if (len > 10) return "text-base sm:text-lg";     // Montant long
  if (len > 7)  return "text-lg sm:text-xl";       // Montant moyen
  return "text-xl sm:text-2xl";                    // Court (par défaut)
}

export function KpiCard({ label, value, icon: Icon, trend, isLoading }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#F2E6E1] bg-white p-3.5 shadow-2xs transition-all duration-200 hover:border-[#8B3A1C]/30 hover:shadow-sm">
      {/* En-tête compact */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-bold uppercase tracking-wider text-stone-500">
          {label}
        </span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FAF6F4] text-[#8B3A1C] border border-[#F2E6E1] transition-transform duration-200 group-hover:scale-105">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Contenu principal avec taille de texte dynamique */}
      <div className="mt-2 flex items-baseline justify-between gap-2">
        {isLoading ? (
          <div className="h-7 w-20 animate-pulse rounded-lg bg-stone-100" />
        ) : (
          <span
            className={cn(
              "font-extrabold tracking-tight text-stone-900 transition-all duration-150 truncate",
              getValueFontSize(value)
            )}
            title={value}
          >
            {value}
          </span>
        )}

        {/* Indicateur de tendance */}
        {trend && !isLoading && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset shrink-0",
              trend.direction === "up"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                : "bg-rose-50 text-rose-700 ring-rose-600/20"
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
            ) : (
              <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />
            )}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}