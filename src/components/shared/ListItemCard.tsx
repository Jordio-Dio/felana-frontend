import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Variantes réutilisables pour le stagger/animation de liste
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export interface Field {
  label: string;
  value: ReactNode;
}

export interface ListItemCardProps {
  leading: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  fields?: Field[];
  trailing?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Carte de liste flottante (style Timecard / Artisan) :
 * Icône/Avatar + Titre/Sous-titre à gauche, métriques/colonnes au centre, badges et actions à droite.
 */
export function ListItemCard({
  leading,
  title,
  subtitle,
  fields,
  trailing,
  actions,
  onClick,
  className,
}: ListItemCardProps) {
  return (
    <motion.div
      variants={listItemVariants}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border border-[#F2E6E1] bg-white p-4 shadow-2xs transition-all duration-200",
        "hover:border-[#8B3A1C]/30 hover:shadow-md sm:flex-row sm:items-center",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Partie gauche : Icône/Avatar + Identité */}
      <div className="flex items-center gap-3 sm:w-56 sm:shrink-0">
        <div className="shrink-0">{leading}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-stone-900 group-hover:text-[#8B3A1C] transition-colors">
            {title}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-stone-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Champs centraux : Colonnes de métriques/informations */}
      {fields && fields.length > 0 && (
        <div className="grid flex-1 grid-cols-2 gap-3 border-t border-[#F2E6E1]/60 pt-3 sm:grid-cols-4 sm:border-t-0 sm:pt-0">
          {fields.map((f, index) => (
            <div key={f.label || index} className="min-w-0">
              <p className="truncate text-[11px] font-medium uppercase tracking-wider text-stone-400">
                {f.label}
              </p>
              <div className="min-w-0 text-xs font-semibold text-stone-800 mt-0.5">
                {f.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partie droite : Badges d'état & Actions */}
      <div className="flex items-center justify-between gap-3 border-t border-[#F2E6E1]/60 pt-2 sm:ml-auto sm:justify-end sm:border-t-0 sm:pt-0 shrink-0">
        {trailing && <div className="flex items-center">{trailing}</div>}
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </div>
    </motion.div>
  );
}