import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye } from "lucide-react";
import { commandeService } from "@/api/commandeService";
import type { Commande, StatutCommande } from "@/types/orders.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, STATUT_LABELS, STATUT_BADGE_CLASSES } from "@/lib/formatters";

const ALL_STATUS = "ALL";

export function CommandesListPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [statutFilter, setStatutFilter] = useState<string>(searchParams.get("statut") || ALL_STATUS);

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
        <Button asChild className="bg-teal-700 text-white hover:bg-teal-800">
          <Link to="/commandes/nouvelle">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle vente
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <Select value={statutFilter} onValueChange={setStatutFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS}>Tous statuts</SelectItem>
              <SelectItem value="EN_ATTENTE">En attente</SelectItem>
              <SelectItem value="EN_ATTENTE_VALIDATION">En attente de validation</SelectItem>
              <SelectItem value="PAYEE">Payée</SelectItem>
              <SelectItem value="LIVREE">Livrée</SelectItem>
              <SelectItem value="ANNULEE">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Vendeur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-400">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : commandes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-400">
                    Aucune commande pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                commandes.map((commande) => (
                  <TableRow key={commande.id}>
                    <TableCell className="font-medium">{commande.reference}</TableCell>
                    <TableCell>
                      {commande.client.prenom ? `${commande.client.prenom} ` : ""}
                      {commande.client.nom}
                    </TableCell>
                    <TableCell className="text-gray-600">{commande.vendeurNom}</TableCell>
                    <TableCell className="text-gray-500">{formatDate(commande.dateCommande)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUT_BADGE_CLASSES[commande.statut]}>
                        {STATUT_LABELS[commande.statut]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(commande.totalAchat)}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <Link to={`/commandes/${commande.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
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