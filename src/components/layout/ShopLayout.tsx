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
          <div className="min-h-screen bg-gray-50">
            <ShopHeader />
            <main className="mx-auto max-w-5xl px-4 py-6">
              <Outlet />
            </main>
          </div>
        </ShopSearchProvider>
      </CartProvider>
    </ClientAuthProvider>
  );
}