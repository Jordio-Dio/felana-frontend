import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { UserPlus, LogIn, X, Sparkles } from "lucide-react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { CartProvider } from "@/context/CartContext";
import { ShopSearchProvider } from "@/context/ShopSearchContext";
import { ClientAuthProvider, useClientAuth } from "@/context/ClientAuthContext";

function GuestBannerPrompt() {
  const { isAuthenticated } = useClientAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, on n'affiche pas la bannière
    if (isAuthenticated) {
      setIsVisible(false);
      return;
    }

    // Vérifie si le visiteur l'a fermée manuellement durant la session
    const isDismissed = sessionStorage.getItem("guest_banner_dismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [isAuthenticated]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("guest_banner_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-2xl -translate-x-1/2 transition-all duration-300 ease-out sm:bottom-6">
      <div className="relative flex flex-col items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-[#FAF8F5]/95 p-4 pr-10 shadow-xl backdrop-blur-md sm:flex-row sm:p-5 sm:pr-12">
        {/* Bouton Fermer */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-200/50 hover:text-stone-700"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Texte & Icône */}
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B3A1C]/10 text-[#8B3A1C]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900">
              Profitez au maximum de Hiba Créations
            </h4>
            <p className="text-xs text-stone-600 sm:text-sm">
              Connectez-vous pour sauvegarder vos favoris et suivre vos commandes.
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex w-full shrink-0 items-center justify-end gap-2.5 sm:w-auto">
          <button
            onClick={() => navigate("/shop/inscription")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:text-stone-900 sm:flex-none sm:text-sm"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Créer un compte
          </button>
          
          <button
            onClick={() => navigate("/shop/connexion")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#8B3A1C] px-4 py-2 text-xs font-medium text-white shadow-md transition-all hover:bg-[#722F16] active:scale-[0.98] sm:flex-none sm:text-sm"
          >
            <LogIn className="h-3.5 w-3.5" />
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShopLayout() {
  return (
    <ClientAuthProvider>
      <CartProvider>
        <ShopSearchProvider>
          <GuestBannerPrompt />
          <div className="min-h-screen bg-[#FAF8F5] text-stone-900 antialiased selection:bg-[#8B3A1C]/15 selection:text-[#8B3A1C]">
            {/* Header de la boutique */}
            <ShopHeader />

            {/* Zone de contenu principal */}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
              <Outlet />
            </main>

            {/* Footer contact (id="contact", cible du lien Contact) */}
            <ShopFooter />
          </div>
        </ShopSearchProvider>
      </CartProvider>
    </ClientAuthProvider>
  );
}