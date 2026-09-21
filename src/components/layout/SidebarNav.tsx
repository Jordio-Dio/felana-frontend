import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/routes/navigation";
import { useAuth } from "@/context/AuthContext";

interface SidebarNavProps {
  onNavigate?: () => void;
}

/**
 * Composant purement présentationnel : filtre les items selon le rôle,
 * puis affiche les liens. Reçoit onNavigate pour fermer le drawer mobile
 * après un clic (sur desktop, le prop est simplement absent/ignoré).
 */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
  );

  return (
    <nav className="flex flex-col gap-1.5 px-3">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-[#FAF6F4] text-[#8B3A1C] shadow-sm ring-1 ring-[#8B3A1C]/10"
                  : "text-stone-600 hover:bg-[#FAF6F4]/60 hover:text-[#8B3A1C]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-[#8B3A1C]"
                      : "text-stone-400 group-hover:text-[#8B3A1C]"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}