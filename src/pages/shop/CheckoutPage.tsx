import { useState, type FormEvent } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Minus, Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
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

  // Session en cours de vérification : n'affiche rien pour éviter un flash
  // de redirection incorrecte.
  if (authLoading) {
    return null;
  }

  // Connexion obligatoire pour commander - redirige vers login en gardant
  // le retour vers /checkout après connexion.
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

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-gray-500">Votre panier est vide.</p>
        <Button asChild className="rounded-full bg-pink-700 text-white hover:bg-pink-800">
          <Link to="/shop">Retour au catalogue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-3.5 w-3.5" />
        Continuer mes achats
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Votre panier</h2>
            <div className="divide-y divide-gray-100">
              {lines.map((line) => (
                <div key={line.article.id} className="flex items-center gap-3 py-3">
                  {line.article.imageUrls[0] && (
                    <img
                      src={line.article.imageUrls[0]}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{line.article.nom}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(line.article.prixVente)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantite(line.article.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center text-sm">{line.quantite}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantite(line.article.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="w-20 text-right text-sm font-medium">
                    {formatCurrency(line.article.prixVente * line.quantite)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500"
                    onClick={() => removeFromCart(line.article.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Finaliser la commande</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Mode de paiement</label>
              <Select value={modePaiement} onValueChange={(v) => setModePaiement(v as ModePaiement)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {MODES_PAIEMENT.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-pink-700 text-white hover:bg-pink-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
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