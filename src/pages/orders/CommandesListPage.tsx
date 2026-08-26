import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Eye, Receipt } from "lucide-react";
import { commandeService } from "@/api/commandeService";
import type { Commande, StatutCommande } from "@/types/orders.types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate, STATUT_LABELS } from "@/lib/formatters";


const ALL_STATUS = "ALL";

import { STATUT_TONES } from "@/lib/statusTones";

export function CommandesListPage() {
  const [searchParams] = useSearchParams();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState<string>(searchParams.get("statut") ?? ALL_STATUS);

  const loadCommandes = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await commandeService.historique({
        size: 100,
        statut: statutFilter !== ALL_STATUS ? (statutFilter as StatutCommande) : undefined,
      });
      setCommandes(page.content);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes :", error);
    } finally {
      setIsLoading(false);
    }
  }, [statutFilter]);

  useEffect(() => {
    loadCommandes();
  }, [loadCommandes]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Commandes</h2>
          <p className="text-sm text-gray-500">Historique de toutes les ventes enregistrées.</p>
        </div>
        
        <Button asChild className="rounded-full bg-rose-400 text-white shadow-sm hover:bg-rose-500">
          <Link to="/commandes/nouvelle">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle vente
          </Link>
        </Button>
      </div>

      <Select value={statutFilter} onValueChange={setStatutFilter}>
        <SelectTrigger className="w-full rounded-full sm:w-56">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUS}>Tous statuts</SelectItem>
          <SelectItem value="EN_ATTENTE">En attente</SelectItem>
          <SelectItem value="EN_ATTENTE_VALIDATION">En attente de validation</SelectItem>
          <SelectItem value="EN_FABRICATION">En fabrication</SelectItem>
          <SelectItem value="PAYEE">Payée</SelectItem>
          <SelectItem value="LIVREE">Livrée</SelectItem>
          <SelectItem value="ANNULEE">Annulée</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-400">Chargement...</p>
        ) : commandes.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">Aucune commande pour le moment.</p>
        ) : (
          commandes.map((commande) => (
            <ListItemCard
              key={commande.id}
              leading={
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <Receipt className="h-5 w-5" />
                </div>
              }
              title={commande.reference}
              subtitle={`${commande.client.prenom ? commande.client.prenom + " " : ""}${commande.client.nom}`}
              fields={[
                { label: "Vendeur", value: commande.vendeurNom },
                { label: "Date", value: formatDate(commande.dateCommande) },
                { label: "Total", value: formatCurrency(commande.totalAchat) },
              ]}
              trailing={<StatusBadge label={STATUT_LABELS[commande.statut]} tone={STATUT_TONES[commande.statut]} />}
              actions={
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Link to={`/commandes/${commande.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}