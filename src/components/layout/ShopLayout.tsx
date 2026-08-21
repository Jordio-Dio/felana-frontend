import { Outlet } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { CartProvider } from "@/context/CartContext";

export function ShopLayout() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <ShopHeader />
        <main className="mx-auto max-w-5xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </CartProvider>
  );
}