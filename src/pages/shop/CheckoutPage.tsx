import { useState, type FormEvent } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Minus, Plus, Trash2, Loader2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useClientAuth } from "@/context/ClientAuthContext";
import { shopService } from "@/api/shopService";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import type { ModePaiement } from "@/types/shop.types";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

const MODES_PAIEMENT: { value: ModePaiement; label: string }[] = [
  { value: "MVOLA_MANUEL", label: "Mvola (transfert manuel)" },
  { value: "ORANGE_MONEY_MANUEL", label: "Orange Money (transfert manuel)" },
  { value: "ESPECES", label: "Espèces (à la livraison/retrait)" },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useClientAuth();
  const { lines, updateQuantite, removeFromCart, total, clearCart } = useCart();

  const [modePaiement, setModePaiement] = useState<ModePaiement | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/shop/connexion" state={{ from: "/checkout" }} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Votre panier est vide.");
      return;
    }
    if (!modePaiement) {
      setError("Veuillez choisir un mode de paiement.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await shopService.createOrder({
        modePaiement,
        items: lines.map((l) => ({ articleId: l.article.id, quantite: l.quantite })),
      });

      clearCart();
      navigate("/order-success", { state: response });
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error ?? "Impossible d'enregistrer votre commande.");
    } finally {
      setIsLoading(false);
    }
  }

  /* --- ÉTAT PANIER VIDE HARMONISÉ --- */
  if (lines.length === 0) {
    return (
      <div className="mx-auto my-12 max-w-md rounded-3xl border border-[#F0E7E3] bg-[#FAF6F0]/80 p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EBE6] text-[#4A2E1B] shadow-inner ring-4 ring-white">
          <ShoppingBag className="h-7 w-7 stroke-[1.75]" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-[#222222]">Votre panier est vide</h3>
        <p className="mt-2 text-sm text-[#666666]">
          Ajoutez des articles de notre collection pour finaliser votre commande.
        </p>
        <Button
          asChild
          className="mt-6 w-full rounded-full bg-[#4A2E1B] py-3 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-[#311B0E] hover:shadow-lg"
        >
          <Link to="/shop">Retour au catalogue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#666666] transition-colors hover:text-[#4A2E1B]"
      >
        <ArrowLeft className="h-4 w-4" />
        Continuer mes achats
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Liste des articles dans le panier */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-[#F0E7E3] bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-lg font-semibold text-[#222222]">
              Votre panier ({lines.length} article{lines.length > 1 ? "s" : ""})
            </h2>
            <div className="divide-y divide-[#F0E7E3]">
              {lines.map((line) => (
                <div key={line.article.id} className="flex items-center gap-4 py-4">
                  {line.article.imageUrls[0] ? (
                    <img
                      src={line.article.imageUrls[0]}
                      alt={line.article.nom}
                      className="h-16 w-16 rounded-xl object-cover border border-[#F0E7E3]"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F5EBE6] text-[#4A2E1B]">
                      <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#222222]">{line.article.nom}</p>
                    <p className="text-xs text-[#666666]">{formatCurrency(line.article.prixVente)} / unité</p>
                  </div>

                  {/* Boutons Quantité */}
                  <div className="flex items-center gap-1 rounded-full border border-[#EAE2DD] bg-[#FAF6F0] p-1">
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[#4A2E1B] transition-colors hover:bg-[#EADBC8]"
                      onClick={() => updateQuantite(line.article.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold text-[#222222]">
                      {line.quantite}
                    </span>
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[#4A2E1B] transition-colors hover:bg-[#EADBC8]"
                      onClick={() => updateQuantite(line.article.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Prix total ligne */}
                  <span className="w-24 text-right text-sm font-semibold text-[#4A2E1B]">
                    {formatCurrency(line.article.prixVente * line.quantite)}
                  </span>

                  {/* Suppression */}
                  <button
                    type="button"
                    className="p-1 text-gray-400 transition-colors hover:text-red-600"
                    onClick={() => removeFromCart(line.article.id)}
                    title="Supprimer l'article"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bloc Récapitulatif et Paiement */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-[#F0E7E3] bg-[#FAF6F0]/50 p-6 shadow-sm backdrop-blur-sm"
          >
            <h2 className="font-serif text-lg font-semibold text-[#222222]">Récapitulatif</h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                Mode de paiement
              </label>
              <Select value={modePaiement} onValueChange={(v) => setModePaiement(v as ModePaiement)}>
                <SelectTrigger className="h-11 rounded-xl border-[#EAE2DD] bg-white text-sm text-[#222222] focus:ring-[#4A2E1B]">
                  <SelectValue placeholder="Choisir un mode de paiement..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#EAE2DD]">
                  {MODES_PAIEMENT.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-sm">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border-t border-[#EAE2DD] pt-4">
              <span className="text-base font-semibold text-[#222222]">Total à payer</span>
              <span className="font-serif text-xl font-bold text-[#4A2E1B]">
                {formatCurrency(total)}
              </span>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#4A2E1B] py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#311B0E] hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                "Valider ma commande"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}