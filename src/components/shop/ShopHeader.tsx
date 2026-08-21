import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export function ShopHeader() {
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/shop" className="text-2xl font-bold tracking-tight text-teal-700">
          Hiba Création
        </Link>
        <Button variant="ghost" className="relative" onClick={() => navigate("/checkout")}>
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-[10px] font-medium text-white">
              {itemCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}