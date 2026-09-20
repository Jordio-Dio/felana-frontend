import { useLocation, Navigate, Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import type { PublicOrderResponse } from "@/types/shop.types";

export function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state as PublicOrderResponse | undefined;

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

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
              {order.instructionsPaiement}
            </p>
          </div>
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