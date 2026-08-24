import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Tendance optionnelle, comme les flèches vertes/rouges de la référence. */
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  isLoading?: boolean;
}

export function KpiCard({ label, value, icon: Icon, trend, isLoading }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50">
          <Icon className="h-5 w-5 text-rose-600" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        {isLoading ? (
          <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
        ) : (
          <span className="text-2xl font-bold text-gray-900 sm:text-3xl">{value}</span>
        )}

        {trend && !isLoading && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.direction === "up" ? "text-emerald-600" : "text-red-500"
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}