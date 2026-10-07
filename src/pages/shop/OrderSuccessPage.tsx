import { useEffect, useState } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { shopService } from "@/api/shopService";
import type { PublicOrderResponse, ShopInfo } from "@/types/shop.types";

/** Libellés des numéros Mobile Money selon le mode choisi au checkout. */
const MODE_NUMERO_LABELS: Record<string, string> = {
  MVOLA_MANUEL: "Mvola",
  ORANGE_MONEY_MANUEL: "Orange Money",
};

export function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state as PublicOrderResponse | undefined;

  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);

  useEffect(() => {
    async function loadShopInfo() {
      try {
        const info = await shopService.getShopInfo();
        setShopInfo(info);
      } catch (error) {
        console.error("Erreur lors du chargement des infos boutique :", error);
      }
    }
    loadShopInfo();
  }, []);

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  const allNumbers = [
    { label: "Mvola", value: shopInfo?.mvolaNumero?.trim() ?? "" },
    { label: "Airtel Money", value: shopInfo?.airtelMoneyNumero?.trim() ?? "" },
    { label: "Orange Money", value: shopInfo?.orangeMoneyNumero?.trim() ?? "" },
  ].filter((n) => n.value !== "");

  // Numéro du mode choisi si disponible, sinon les 3 numéros.
  const chosenLabel = MODE_NUMERO_LABELS[order.modePaiement];
  const chosenNumber = chosenLabel
    ? allNumbers.find((n) => n.label === chosenLabel)
    : undefined;
  const paymentNumbers = chosenNumber ? [chosenNumber] : allNumbers;

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white p-6 sm:p-8 text-center shadow-xl shadow-[#8B3A1C]/5">
        {/* En-tête avec Icône */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEEE9]">
          <CheckCircle2 className="h-9 w-9 text-[#8B3A1C] stroke-[2.2]" />
        </div>

        <span className="mb-2 inline-block rounded-full bg-[#FAF6F4] px-3 py-1 text-xs font-semibold text-[#8B3A1C]">
          Succès
        </span>

        <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Commande enregistrée !
        </h2>
        
        <p className="mt-1 text-xs sm:text-sm text-stone-500">
          Référence : <span className="font-mono font-bold text-stone-700">{order.reference}</span>
        </p>

        {/* Détails de la commande */}
        <div className="mt-6 rounded-2xl border border-[#F2E6E1] bg-[#FAF6F4]/70 p-5 text-left space-y-4">
          <div>
            <p className="text-xs font-medium text-stone-500">Montant total</p>
            <p className="text-2xl font-black text-[#8B3A1C]">
              {formatCurrency(order.totalAchat)}
            </p>
          </div>

          {/* Bloc d'instructions de paiement (Harmonisé & Sobre) */}
          <div className="rounded-xl border border-[#E09F82]/30 bg-[#FDEEE9]/80 p-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8B3A1C]">
              Instructions de paiement
            </p>
            <p className="text-xs sm:text-sm text-[#5C2817] leading-relaxed">
              {order.modePaiement === "ESPECES"
                ? "Le paiement en espèces se fera à la livraison ou au retrait."
                : order.instructionsPaiement + " (numéros ci-dessous)"}
            </p>
          </div>

          {/* Numéros Mobile Money (depuis /v1/public/shop-info) */}
          {paymentNumbers.length > 0 && (
            <ul className="space-y-1.5">
              {paymentNumbers.map((numero) => (
                <li
                  key={numero.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#E09F82]/25 bg-white px-3.5 py-2.5"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-[#5C2817]">
                    <Smartphone className="h-3.5 w-3.5 text-[#8B3A1C]" />
                    {numero.label}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#8B3A1C]">
                    {numero.value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bouton d'action principal (Couleur sobre) */}
        <Button 
          asChild 
          className="mt-6 w-full gap-2 rounded-2xl bg-[#8B3A1C] py-5 text-xs font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F16] active:scale-[0.98]"
        >
          <Link to="/shop">
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </Link>
        </Button>
      </div>
    </div>
  );
}