import { useState, type FormEvent } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Minus, Plus, Trash2, Loader2, ArrowLeft, ShoppingBag, CreditCard, AlertCircle } from "lucide-react";
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
  { value: "MVOLA_MANUEL", label: "MVola (transfert manuel)" },
  { value: "ORANGE_MONEY_MANUEL", label: "Orange Money (transfert manuel)" },
  { value: "ESPECES", label: "Espèces (à la livraison / retrait)" },
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
      <div className="mx-auto my-12 max-w-md rounded-3xl border border-[#F2E6E1] bg-white p-8 text-center shadow-xl shadow-[#8B3A1C]/5 sm:p-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B3A1C]/10 text-[#8B3A1C] ring-4 ring-[#8B3A1C]/5">
          <ShoppingBag className="h-8 w-8 stroke-[1.75]" />
        </div>
        <h3 className="font-serif text-xl font-bold text-stone-900">Votre panier est vide</h3>
        <p className="mt-2 text-xs font-medium text-stone-500">
          Explorez nos pièces artisanales et vêtements tendance pour garnir votre panier.
        </p>
        <Button
          asChild
          className="mt-6 h-11 w-full gap-2 rounded-xl bg-[#8B3A1C] text-xs font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F16] active:scale-[0.98]"
        >
          <Link to="/shop">
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au catalogue</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 transition-colors hover:text-[#8B3A1C]"
      >
        <ArrowLeft className="h-4 w-4 text-[#8B3A1C]" />
        Continuer mes achats
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Liste des articles dans le panier */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white p-6 shadow-xl shadow-[#8B3A1C]/5">
            <h2 className="mb-4 font-serif text-lg font-bold text-stone-900">
              Votre panier ({lines.length} article{lines.length > 1 ? "s" : ""})
            </h2>
            <div className="divide-y divide-[#F2E6E1]">
              {lines.map((line) => (
                <div key={line.article.id} className="flex items-center gap-4 py-4">
                  {line.article.imageUrls && line.article.imageUrls[0] ? (
                    <img
                      src={line.article.imageUrls[0]}
                      alt={line.article.nom}
                      className="h-16 w-16 rounded-2xl border border-[#F2E6E1] object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF6F4] text-[#8B3A1C] border border-[#F2E6E1]">
                      <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-stone-900">{line.article.nom}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-stone-500">
                      {formatCurrency(line.article.prixVente)} / unité
                    </p>
                  </div>

                  {/* Boutons Quantité */}
                  <div className="flex items-center gap-1 rounded-xl border border-[#F2E6E1] bg-[#FAF6F4]/60 p-1">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8B3A1C] transition-colors hover:bg-white hover:shadow-xs active:scale-95"
                      onClick={() => updateQuantite(line.article.id, -1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-stone-900">
                      {line.quantite}
                    </span>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8B3A1C] transition-colors hover:bg-white hover:shadow-xs active:scale-95"
                      onClick={() => updateQuantite(line.article.id, 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Prix total ligne */}
                  <span className="w-24 text-right text-xs font-bold text-[#8B3A1C]">
                    {formatCurrency(line.article.prixVente * line.quantite)}
                  </span>

                  {/* Suppression */}
                  <button
                    type="button"
                    className="p-1.5 text-stone-400 transition-colors hover:text-red-600 focus:outline-none"
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
            className="space-y-5 rounded-3xl border border-[#F2E6E1] bg-white p-6 shadow-xl shadow-[#8B3A1C]/5"
          >
            <div className="flex items-center gap-2 border-b border-[#F2E6E1] pb-3">
              <CreditCard className="h-5 w-5 text-[#8B3A1C]" />
              <h2 className="font-serif text-lg font-bold text-stone-900">Récapitulatif</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Mode de paiement *
              </label>
              <Select value={modePaiement} onValueChange={(v) => setModePaiement(v as ModePaiement)}>
                <SelectTrigger className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs text-stone-900 focus:border-[#8B3A1C] focus:ring-[#8B3A1C]">
                  <SelectValue placeholder="Choisir un mode de paiement..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#F2E6E1] bg-white">
                  {MODES_PAIEMENT.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs font-medium focus:bg-[#FAF6F4] focus:text-[#8B3A1C]">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border-t border-[#F2E6E1] pt-4">
              <span className="text-xs font-bold text-stone-700">Total à payer</span>
              <span className="font-serif text-xl font-black text-[#8B3A1C]">
                {formatCurrency(total)}
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full gap-2 rounded-xl bg-[#8B3A1C] text-xs font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F16] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <span>Valider ma commande</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}