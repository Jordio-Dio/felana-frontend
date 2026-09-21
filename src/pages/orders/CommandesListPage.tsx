import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Eye,
  Receipt,
  Filter,
  ShoppingBag,
  UserCheck,
  RefreshCw,
} from "lucide-react";
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
import { STATUT_TONES } from "@/lib/statusTones";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ALL_STATUS = "ALL";

export function CommandesListPage() {
  const [searchParams] = useSearchParams();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState<string>(
    searchParams.get("statut") ?? ALL_STATUS
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const loadCommandes = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await commandeService.historique({
        size: 100,
        statut:
          statutFilter !== ALL_STATUS
            ? (statutFilter as StatutCommande)
            : undefined,
      });
      setCommandes(
        [...page.content].sort(
          (a, b) =>
            new Date(b.dateCommande).getTime() -
            new Date(a.dateCommande).getTime()
        )
      );
    } catch (error) {
      console.error("Erreur lors du chargement des commandes :", error);
    } finally {
      setIsLoading(false);
    }
  }, [statutFilter]);

  useEffect(() => {
    loadCommandes();
  }, [loadCommandes, refreshKey]);

  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1);
    window.addEventListener("invalidate-cache", handler);
    return () => window.removeEventListener("invalidate-cache", handler);
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* En-tête de la page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Commandes & Ventes
          </h1>
          <p className="mt-0.5 text-xs font-medium text-stone-500 sm:text-sm">
            Historique complet et suivi du traitement de toutes vos ventes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadCommandes()}
            disabled={isLoading}
            className="rounded-xl border-[#F2E6E1] bg-white text-xs font-semibold text-stone-700 shadow-sm transition-all hover:bg-[#FAF6F4] hover:text-[#8B3A1C]"
          >
            <RefreshCw
              className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin text-[#8B3A1C]" : ""}`}
            />
            Actualiser
          </Button>

          <Button
            asChild
            size="sm"
            className="rounded-xl bg-[#8B3A1C] px-4 font-semibold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F17]"
          >
            <Link to="/commandes/nouvelle">
              <Plus className="mr-1.5 h-4 w-4 stroke-[2.5]" />
              Nouvelle vente
            </Link>
          </Button>
        </div>
      </div>

      {/* Barre d'outils et Filtres */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#F2E6E1] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-stone-600">
          <Filter className="h-4 w-4 text-[#8B3A1C]" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Filtrer par statut
          </span>
        </div>

        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-full rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 font-medium text-stone-800 transition-colors focus:bg-white focus:ring-[#8B3A1C]/20 sm:w-64">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-[#F2E6E1]">
            <SelectItem value={ALL_STATUS}>Tous les statuts</SelectItem>
            <SelectItem value="EN_ATTENTE">En attente</SelectItem>
            <SelectItem value="EN_ATTENTE_VALIDATION">En attente de validation</SelectItem>
            <SelectItem value="EN_FABRICATION">En fabrication</SelectItem>
            <SelectItem value="PAYEE">Payée</SelectItem>
            <SelectItem value="LIVREE">Livrée</SelectItem>
            <SelectItem value="ANNULEE">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-3">
        {isLoading ? (
          /* Squelette de chargement */
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex h-20 w-full animate-pulse items-center justify-between rounded-2xl border border-[#F2E6E1]/50 bg-white px-5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-stone-100" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-stone-200" />
                    <div className="h-3 w-24 rounded bg-stone-100" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-6 w-20 rounded-full bg-stone-100" />
                  <div className="h-8 w-8 rounded-full bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        ) : commandes.length === 0 ? (
          /* Aucun résultat */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#F2E6E1] bg-white/60 py-12 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF6F4] text-[#8B3A1C]">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">
              Aucune commande trouvée
            </h3>
            <p className="mt-1 text-xs text-stone-400">
              {statutFilter !== ALL_STATUS
                ? "Aucune commande ne correspond au statut sélectionné."
                : "Commencez par enregistrer une nouvelle vente."}
            </p>
            {statutFilter !== ALL_STATUS && (
              <Button
                variant="link"
                onClick={() => setStatutFilter(ALL_STATUS)}
                className="mt-2 text-xs font-semibold text-[#8B3A1C]"
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          /* Liste principale */
          commandes.map((commande) => (
            <ListItemCard
              key={commande.id}
              leading={
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF6F4] text-[#8B3A1C] ring-1 ring-[#8B3A1C]/10 transition-colors group-hover:bg-[#8B3A1C] group-hover:text-white">
                  <Receipt className="h-5 w-5" />
                </div>
              }
              title={
                <span className="font-mono text-xs font-bold tracking-tight text-stone-900 sm:text-sm">
                  {commande.reference}
                </span>
              }
              subtitle={`${commande.client.prenom ? commande.client.prenom + " " : ""}${commande.client.nom}`}
              fields={[
                {
                  label: "Vendeur",
                  value: (
                    <span className="inline-flex items-center gap-1 font-medium text-stone-600">
                      <UserCheck className="h-3 w-3 text-stone-400" />
                      {commande.vendeurNom}
                    </span>
                  ),
                },
                {
                  label: "Date",
                  value: formatDate(commande.dateCommande),
                },
                {
                  label: "Total",
                  value: (
                    <span className="font-bold text-[#8B3A1C]">
                      {formatCurrency(commande.totalAchat)}
                    </span>
                  ),
                },
              ]}
              trailing={
                <StatusBadge
                  label={STATUT_LABELS[commande.statut]}
                  tone={STATUT_TONES[commande.statut]}
                />
              }
              actions={
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-stone-400 hover:bg-[#FAF6F4] hover:text-[#8B3A1C]"
                    >
                      <Link to={`/commandes/${commande.id}`}>
                        <Eye className="h-4.5 w-4.5" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-lg bg-stone-900 text-xs font-medium text-white">
                    Voir les détails
                  </TooltipContent>
                </Tooltip>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}