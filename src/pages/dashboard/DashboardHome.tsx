import { useCallback, useEffect, useState } from "react";
import {
  ShoppingCart,
  Package,
  Wallet,
  Trophy,
  Receipt,
  RefreshCw,
  UserCheck,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { KpiCard } from "@/components/shared/KpiCard";
import { articleService } from "@/api/articleService";
import { commandeService } from "@/api/commandeService";
import { salesService } from "@/api/salesService";
import { formatCurrency, formatDate, STATUT_LABELS } from "@/lib/formatters";
import { STATUT_TONES } from "@/lib/statusTones";
import type { Commande } from "@/types/orders.types";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  ventesDuJour: number;
  recetteDuJour: number;
  stockTotal: number;
  meilleurVendeur: string;
}

function getStartOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/** Détermine le vendeur ayant généré le plus de chiffre d'affaires ce mois-ci. */
function computeMeilleurVendeur(commandes: Commande[]): string {
  if (commandes.length === 0) return "—";

  const totauxParVendeur = new Map<string, number>();
  for (const commande of commandes) {
    const total = totauxParVendeur.get(commande.vendeurNom) ?? 0;
    totauxParVendeur.set(commande.vendeurNom, total + commande.totalAchat);
  }

  let meilleur = "—";
  let maxTotal = -1;
  for (const [vendeur, total] of totauxParVendeur) {
    if (total > maxTotal) {
      maxTotal = total;
      meilleur = vendeur;
    }
  }
  return meilleur;
}

export function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentes, setRecentes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [articlesPage, commandesDuMois, dernieresCommandes] =
        await Promise.all([
          articleService.search({ actif: true }),
          commandeService.historique({
            dateDebut: getStartOfMonth(),
            statut: "PAYEE",
            size: 1000,
          }),
          commandeService.historique({ size: 50 }),
        ]);
      const stockTotal = articlesPage.content.reduce(
        (sum, a) => sum + a.quantiteStock,
        0
      );

      let ventesDuJour: { nombreVentes: number; montantTotal: number } = {
        nombreVentes: 0,
        montantTotal: 0,
      };
      try {
        const data = await salesService.getToday();
        ventesDuJour = {
          nombreVentes: data.nombreVentes ?? 0,
          montantTotal: data.montantTotal ?? 0,
        };
      } catch {}

      setStats({
        ventesDuJour: ventesDuJour.nombreVentes,
        recetteDuJour: ventesDuJour.montantTotal,
        stockTotal,
        meilleurVendeur: computeMeilleurVendeur(commandesDuMois.content),
      });

      // Tri explicite : Les éléments les plus récents se retrouvent en haut de liste
      const commandesTriees = [...dernieresCommandes.content].sort(
        (a, b) =>
          new Date(b.dateCommande).getTime() -
          new Date(a.dateCommande).getTime()
      );
      setRecentes(commandesTriees);
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard :", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, refreshKey]);

  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1);
    window.addEventListener("invalidate-cache", handler);
    return () => window.removeEventListener("invalidate-cache", handler);
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* En-tête de bienvenue */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Tableau de bord
          </h1>
          <p className="text-xs text-stone-500 sm:text-sm">
            Aperçu des performances de la boutique aujourd'hui.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadDashboard()}
          disabled={isLoading}
          className="self-start rounded-xl border-[#F2E6E1] bg-white text-xs font-semibold text-stone-700 shadow-sm transition-all hover:bg-[#FAF6F4] hover:text-[#8B3A1C] sm:self-auto"
        >
          <RefreshCw
            className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin text-[#8B3A1C]" : ""}`}
          />
          Actualiser
        </Button>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ventes du jour"
          value={stats ? String(stats.ventesDuJour) : "0"}
          icon={ShoppingCart}
          isLoading={isLoading}
        />
        <KpiCard
          label="Stock total"
          value={stats ? String(stats.stockTotal) : "0"}
          icon={Package}
          isLoading={isLoading}
        />
        <KpiCard
          label="Recette du jour"
          value={stats ? formatCurrency(stats.recetteDuJour) : formatCurrency(0)}
          icon={Wallet}
          isLoading={isLoading}
        />
        <KpiCard
          label="Top vendeur (Mois)"
          value={stats?.meilleurVendeur ?? "—"}
          icon={Trophy}
          isLoading={isLoading}
        />
      </div>

      {/* Section Dernières Commandes */}
      <div className="overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white p-5 shadow-xl shadow-[#8B3A1C]/5 backdrop-blur-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between border-b border-[#F2E6E1]/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8B3A1C]/10 text-[#8B3A1C]">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-stone-900 sm:text-base">
                Dernières commandes
              </h2>
              <p className="text-[11px] font-medium text-stone-400">
                Aperçu des récents achats effectués
              </p>
            </div>
          </div>

          {/* Bouton Voir plus */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="group text-xs font-semibold text-[#8B3A1C] hover:bg-[#FAF6F4] hover:text-[#8B3A1C]"
          >
            <Link to="/commandes" className="flex items-center gap-1.5">
              <span>Voir plus</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            /* Skeleton Loader */
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex h-16 w-full animate-pulse items-center justify-between rounded-2xl bg-stone-50 px-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-stone-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-28 rounded bg-stone-200" />
                      <div className="h-2.5 w-20 rounded bg-stone-100" />
                    </div>
                  </div>
                  <div className="h-6 w-16 rounded-lg bg-stone-200" />
                </div>
              ))}
            </div>
          ) : recentes.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF6F4] text-stone-400">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-stone-700">
                Aucune commande pour le moment
              </p>
              <p className="mt-1 text-[11px] text-stone-400">
                Les nouvelles ventes apparaîtront ici.
              </p>
            </div>
          ) : (
            /* Liste triée (affichant les 5 plus récentes) */
            recentes.slice(0, 5).map((commande) => (
              <ListItemCard
                key={commande.id}
                leading={
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF6F4] text-[#8B3A1C] ring-1 ring-[#8B3A1C]/10 transition-colors group-hover:bg-[#8B3A1C] group-hover:text-white">
                    <Receipt className="h-5 w-5" />
                  </div>
                }
                title={
                  <span className="font-mono text-xs font-bold text-stone-900 sm:text-sm">
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
                  { label: "Date", value: formatDate(commande.dateCommande) },
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
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}