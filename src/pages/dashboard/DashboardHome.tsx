import { useEffect, useState } from "react";
import { ShoppingCart, Package, Wallet, Trophy } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";
import { articleService } from "@/api/articleService";
import { commandeService } from "@/api/commandeService";
import { formatCurrency, formatDate, STATUT_LABELS } from "@/lib/formatters";
import { STATUT_TONES } from "@/lib/statusTones";
import type { Commande } from "@/types/orders.types";
import { Receipt } from "lucide-react";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface DashboardStats {
  ventesDuJour: number;
  recetteDuJour: number;
  stockTotal: number;
  meilleurVendeur: string;
}

function getStartOfDay(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
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

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [articlesPage, commandesDuJour, commandesDuMois, dernieresCommandes] =
          await Promise.all([
            articleService.search({ actif: true }),
            commandeService.historique({ dateDebut: getStartOfDay(), statut: "PAYEE", size: 1000 }),
            commandeService.historique({ dateDebut: getStartOfMonth(), statut: "PAYEE", size: 1000 }),
            commandeService.historique({ size: 5 }),
          ]);
        const stockTotal = articlesPage.content.reduce((sum, a) => sum + a.quantiteStock, 0);
        const recetteDuJour = commandesDuJour.content.reduce((sum, c) => sum + c.totalAchat, 0);

        setStats({
          ventesDuJour: commandesDuJour.totalElements,
          recetteDuJour,
          stockTotal,
          meilleurVendeur: computeMeilleurVendeur(commandesDuMois.content),
        });
        setRecentes(dernieresCommandes.content);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard :", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
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
          label="Vendeur du mois"
          value={stats?.meilleurVendeur ?? "—"}
          icon={Trophy}
          isLoading={isLoading}
        />
      </div>

      {/* Tableau des dernières commandes */}
      {/* Dernières commandes */}
<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
  <h2 className="mb-4 text-sm font-semibold text-gray-900">Dernières commandes</h2>

  <div className="space-y-3">
    {isLoading ? (
      <p className="py-6 text-center text-sm text-gray-400">Chargement...</p>
    ) : recentes.length === 0 ? (
      <p className="py-6 text-center text-sm text-gray-400">Aucune commande pour le moment.</p>
    ) : (
      recentes.map((commande) => (
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
        />
      ))
    )}
  </div>
</div>
    </div>
  );
}