import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useShopSearch } from "@/context/ShopSearchContext";
import { useClientAuth } from "@/context/ClientAuthContext";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Accueil", sectionId: "hero" },
  { label: "Catalogue", sectionId: "catalogue" },
  { label: "Notre histoire", sectionId: "histoire" },
];

export function ShopHeader() {
  const { itemCount } = useCart();
  const { search, setSearch } = useShopSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const { client, isAuthenticated, logout } = useClientAuth();

  const [activeSection, setActiveSection] = useState<string>("hero");

  const isOnCommandes = location.pathname === "/shop/mes-commandes";

  useEffect(() => {
    if (isOnCommandes || location.pathname !== "/shop") return;

    const sections = NAV_LINKS.map((l) => document.getElementById(l.sectionId)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          setActiveSection(topMost.target.id);
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [location.pathname, isOnCommandes]);

  function handleNavClick(sectionId: string) {
    if (location.pathname !== "/shop") {
      navigate("/shop");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function isLinkActive(sectionId: string) {
    return !isOnCommandes && location.pathname === "/shop" && activeSection === sectionId;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#F0E7E3] bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center gap-4">
          <Link
            to="/shop"
            className="-rotate-0 shrink-0 whitespace-nowrap font-serif text-xl italic tracking-tight text-[#4A2E1B] sm:text-2xl"
          >
            Hiba Créations Toamasina
          </Link>

          {/* Navigation centrée */}
          <nav className="mx-auto hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.sectionId)}
                className={cn(
                  "group relative py-1 text-sm font-medium transition-all duration-300",
                  isLinkActive(link.sectionId)
                    ? "font-semibold text-[#4A2E1B]"
                    : "text-[#666666] hover:text-[#4A2E1B]"
                )}
              >
                {link.label}

                {/* Ligne d'accentuation sous le lien actif ou au survol */}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-[2px] w-full origin-left rounded-full bg-[#4A2E1B] transition-transform duration-300",
                    isLinkActive(link.sectionId)
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </button>
            ))}

            {/* Lien "Mes commandes"  */}
            {isAuthenticated && (
              <Link
                to="/shop/mes-commandes"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#4A2E1B]",
                  isOnCommandes ? "font-semibold text-[#4A2E1B]" : "text-[#666666]"
                )}
              >
                Mes commandes
              </Link>
            )}
          </nav>

          {/* Recherche */}
          <div className="relative ml-auto hidden w-52 sm:block md:ml-0">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="h-10 rounded-full border-[#EAE2DD] bg-[#F9F9F9] pl-10 text-sm text-[#222222] placeholder:text-[#666666]"
              />
            </div>
          </div>

          {/* Compte Utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EBE6] text-[#222222] transition-colors hover:bg-[#EADBC8] hover:text-[#311B0E]"
                title="Mon compte"
                aria-label="Mon compte"
              >
                <User className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAuthenticated ? (
                <>
                  <div className="px-2 py-1.5 text-xs text-gray-500">Bonjour, {client?.nom}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/shop/profil")}>
                    <User className="mr-2 h-4 w-4" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/shop/mes-commandes")}>
                    <Package className="mr-2 h-4 w-4" />
                    Mes commandes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => navigate("/shop/connexion")}>
                    Se connecter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/shop/inscription")}>
                    Créer un compte
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Icône panier */}
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              aria-label="Voir le panier"
              title={`Voir le panier (${itemCount} article${itemCount > 1 ? "s" : ""})`}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EBE6] text-[#222222] transition-colors duration-300 hover:bg-[#EADBC8] hover:text-[#311B0E]"
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4A2E1B] px-1 text-[10px] font-medium text-white shadow-sm ring-2 ring-white transition-transform group-hover:scale-110">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Recherche mobile */}
        <div className="relative pb-3 sm:hidden">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article..."
              className="h-10 rounded-full border-gray-200 bg-gray-50 pl-10 text-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
}