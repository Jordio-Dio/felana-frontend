import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Field {
  label: string;
  value: ReactNode;
}

interface ListItemCardProps {
  leading: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  fields?: Field[];
  trailing?: ReactNode;
  actions?: ReactNode;
}

/**
 * Ligne de liste sous forme de carte flottante (façon Timecard) : avatar/icône
 * + titre/sous-titre à gauche, colonnes de données au centre, badge/actions
 * à droite. Remplace les <Table> classiques sur les pages de liste internes.
 */
export function ListItemCard({ leading, title, subtitle, fields, trailing, actions }: ListItemCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:flex-row sm:items-center">
      <div className="flex items-center gap-3 sm:w-52 sm:shrink-0">
        {leading}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
          {subtitle && <p className="truncate text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>

      {fields && fields.length > 0 && (
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {fields.map((f) => (
            <div key={f.label}>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">{f.label}</p>
              <div className="text-sm font-medium text-gray-900">{f.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 sm:ml-auto">
        {trailing}
        {actions}
      </div>
    </div>
  );
}