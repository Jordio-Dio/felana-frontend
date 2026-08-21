import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ArticlePublic } from "@/types/shop.types";

export interface CartLine {
  article: ArticlePublic;
  quantite: number;
}

interface CartContextValue {
  lines: CartLine[];
  addToCart: (article: ArticlePublic) => void;
  updateQuantite: (articleId: number, delta: number) => void;
  removeFromCart: (articleId: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "felana_shop_cart";

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  function addToCart(article: ArticlePublic) {
    setLines((prev) => {
      const existing = prev.find((l) => l.article.id === article.id);
      if (existing) {
        return prev.map((l) =>
          l.article.id === article.id ? { ...l, quantite: l.quantite + 1 } : l
        );
      }
      return [...prev, { article, quantite: 1 }];
    });
  }

  function updateQuantite(articleId: number, delta: number) {
    setLines((prev) =>
      prev
        .map((l) => (l.article.id === articleId ? { ...l, quantite: l.quantite + delta } : l))
        .filter((l) => l.quantite > 0)
    );
  }

  function removeFromCart(articleId: number) {
    setLines((prev) => prev.filter((l) => l.article.id !== articleId));
  }

  function clearCart() {
    setLines([]);
  }

  const total = lines.reduce((sum, l) => sum + l.article.prixVente * l.quantite, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantite, 0);

  return (
    <CartContext.Provider
      value={{ lines, addToCart, updateQuantite, removeFromCart, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé à l'intérieur d'un <CartProvider>.");
  return context;
}