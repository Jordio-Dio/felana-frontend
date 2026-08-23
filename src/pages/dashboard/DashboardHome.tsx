import { useEffect, useState } from "react";
import { ShoppingCart, Package, Wallet, Trophy } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";
import { articleService } from "@/api/articleService";
import { commandeService } from "@/api/commandeService";
import { formatCurrency, formatDate, STATUT_LABELS, STATUT_BADGE_CLASSES } from "@/lib/formatters";
import type { Commande } from "@/types/orders.types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Dernières commandes</h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-400">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : recentes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-400">
                    Aucune commande pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                recentes.map((commande) => (
                  <TableRow key={commande.id}>
                    <TableCell className="font-medium">{commande.reference}</TableCell>
                    <TableCell>
                      {commande.client.prenom ? `${commande.client.prenom} ` : ""}
                      {commande.client.nom}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(commande.dateCommande)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUT_BADGE_CLASSES[commande.statut]}
                      >
                        {STATUT_LABELS[commande.statut]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(commande.totalAchat)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}