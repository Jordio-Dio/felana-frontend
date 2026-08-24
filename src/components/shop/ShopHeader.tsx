import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useShopSearch } from "@/context/ShopSearchContext";
import { Input } from "@/components/ui/input";

const NAV_LINKS = [
  { label: "Accueil", href: "#" },
  { label: "Catalogue", href: "#catalogue" },
  { label: "Notre histoire", href: "#catalogue" },
];

export function ShopHeader() {
  const { itemCount } = useCart();
  const { search, setSearch } = useShopSearch();
  const navigate = useNavigate();

  function handleNavClick(href: string) {
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center gap-4">
          <Link to="/shop" className="shrink-0 text-2xl font-bold tracking-tight text-rose-700">
            Hiba Creation
          </Link>

          {/* Navigation centrée, visible à partir de md */}
          <nav className="mx-auto hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-teal-700"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Recherche courte, visible dès sm */}
          <div className="relative ml-auto hidden w-52 sm:block md:ml-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="rounded-full border-gray-200 bg-gray-50 pl-9"
            />
          </div>

          {/* Icônes dans pastilles rondes, façon Glowora */}
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              aria-label="Voir le panier"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Recherche mobile : ligne dédiée en dessous */}
        <div className="relative pb-3 sm:hidden">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="rounded-full border-gray-200 bg-gray-50 pl-9"
          />
        </div>
      </div>
    </header>
  );
}