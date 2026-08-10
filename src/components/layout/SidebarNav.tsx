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
    <nav className="flex flex-col gap-1 px-2">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}