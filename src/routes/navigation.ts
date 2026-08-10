import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Tags,
    UserCog,
    type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/auth.types";

export interface NavItem {
    label: string;
    path: string;
    icon: LucideIcon;
    /** Si omis, visible par tous les rôles authentifiés. */
    allowedRoles?: Role[];
}

/**
 * Source unique de vérité pour le menu de navigation. La Sidebar filtre
 * automatiquement selon le rôle de l'utilisateur connecté - aucune
 * duplication de logique entre desktop et mobile.
 */
export const NAV_ITEMS: NavItem[] = [
    { label: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
    { label: "Commandes", path: "/commandes", icon: ShoppingCart },
    { label: "Articles", path: "/articles", icon: Package },
    { label: "Catégories", path: "/categories", icon: Tags, allowedRoles: ["GERANT"] },
    { label: "Clients", path: "/clients", icon: Users },
    { label: "Vendeurs", path: "/vendeurs", icon: UserCog, allowedRoles: ["GERANT"] },
];