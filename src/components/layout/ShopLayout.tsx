import { Outlet } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { CartProvider } from "@/context/CartContext";
import { ShopSearchProvider } from "@/context/ShopSearchContext";
import { ClientAuthProvider } from "@/context/ClientAuthContext";

export function ShopLayout() {
  return (
    <ClientAuthProvider>
      <CartProvider>
        <ShopSearchProvider>
          <div className="min-h-screen bg-[#FAF8F5] text-stone-900 antialiased selection:bg-[#8B3A1C]/15 selection:text-[#8B3A1C]">
            {/* Header de la boutique */}
            <ShopHeader />

            {/* Zone de contenu principal */}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
              <Outlet />
            </main>
          </div>
        </ShopSearchProvider>
      </CartProvider>
    </ClientAuthProvider>
  );
}