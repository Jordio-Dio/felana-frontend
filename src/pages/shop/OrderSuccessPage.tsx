import { useLocation, Navigate, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
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
    <div className="mx-auto max-w-md py-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
        <CheckCircle2 className="h-7 w-7 text-rose-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Commande enregistrée !</h2>
      <p className="mt-1 text-sm text-gray-500">
        Référence : <span className="font-medium text-gray-900">{order.reference}</span>
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm">
        <p className="text-sm text-gray-500">Montant total</p>
        <p className="text-2xl font-bold text-rose-700">{formatCurrency(order.totalAchat)}</p>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">Instructions de paiement</p>
          <p className="mt-1 text-sm text-amber-700">{order.instructionsPaiement}</p>
        </div>
      </div>

      <Button asChild className="mt-6 bg-rose-700 text-white hover:bg-rose-800">
        <Link to="/shop">Retour au catalogue</Link>
      </Button>
    </div>
  );
}