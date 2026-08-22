import { createContext, useContext, useState, type ReactNode } from "react";

interface ShopSearchContextValue {
  search: string;
  setSearch: (value: string) => void;
}

const ShopSearchContext = createContext<ShopSearchContextValue | undefined>(undefined);

export function ShopSearchProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  return (
    <ShopSearchContext.Provider value={{ search, setSearch }}>
      {children}
    </ShopSearchContext.Provider>
  );
}

export function useShopSearch(): ShopSearchContextValue {
  const context = useContext(ShopSearchContext);
  if (!context) throw new Error("useShopSearch doit être utilisé à l'intérieur d'un <ShopSearchProvider>.");
  return context;
}