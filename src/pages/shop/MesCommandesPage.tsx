import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";
import { axiosInstance } from "@/api/axiosInstance";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { STATUT_TONES } from "@/lib/statusTones";
import { formatCurrency, formatDate, STATUT_LABELS } from "@/lib/formatters";
import type { Commande } from "@/types/orders.types";
import type { PageResponse } from "@/types/api.types";
import { Skeleton } from "@/components/ui/skeleton";


export function MesCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await axiosInstance.get<PageResponse<Commande>>("/v1/public/mes-commandes", {
          params: { size: 50 },
        });
        setCommandes(data.content);
      } catch (error) {
        console.error("Erreur lors du chargement de vos commandes :", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Mes commandes</h2>
        <p className="text-sm text-gray-500">Retrouvez l'historique et le statut de vos commandes.</p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))
        ) : commandes.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400">Vous n'avez pas encore passé de commande.</p>
            <Link to="/shop" className="mt-2 inline-block text-sm font-medium text-pink-700 hover:underline">
              Découvrir le catalogue
            </Link>
          </div>
        ) : (
          commandes.map((commande) => (
            <ListItemCard
              key={commande.id}
              leading={
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                  <Receipt className="h-5 w-5" />
                </div>
              }
              title={commande.reference}
              subtitle={formatDate(commande.dateCommande)}
              fields={[
                { label: "Articles", value: `${commande.lignes.length} article(s)` },
                { label: "Total", value: formatCurrency(commande.totalAchat) },
              ]}
              trailing={<StatusBadge label={STATUT_LABELS[commande.statut]} tone={STATUT_TONES[commande.statut]} />}
            />
          ))
        )}
      </div>
    </div>
  );
}