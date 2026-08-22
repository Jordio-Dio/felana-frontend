import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useShopSearch } from "@/context/ShopSearchContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ShopHeader() {
  const { itemCount } = useCart();
  const { search, setSearch } = useShopSearch();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-16 items-center gap-3">
          <Link to="/shop" className="shrink-0 text-2xl font-bold tracking-tight text-teal-700">
            Hiba Tamatave
          </Link>

          {/* Recherche visible uniquement à partir de sm: (côté droit du header) */}
          <div className="relative ml-auto hidden w-56 sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="rounded-full pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <Button
              variant="ghost"
              className="relative"
              onClick={() => navigate("/checkout")}
              aria-label="Voir le panier"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Recherche mobile : ligne dédiée en dessous, visible seulement sous sm: */}
        <div className="relative pb-3 sm:hidden">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="rounded-full pl-9"
          />
        </div>
      </div>
    </header>
  );
}