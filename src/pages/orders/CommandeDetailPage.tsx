import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import { commandeService } from "@/api/commandeService";
import { useAuth } from "@/context/AuthContext";
import type { Commande, StatutCommande, Invoice } from "@/types/orders.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, STATUT_LABELS, STATUT_BADGE_CLASSES } from "@/lib/formatters";

const STATUTS: StatutCommande[] = ["EN_ATTENTE", "PAYEE", "LIVREE", "ANNULEE"];

export function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [commande, setCommande] = useState<Commande | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatut, setIsUpdatingStatut] = useState(false);

  async function load() {
    if (!id) return;
    setIsLoading(true);
    try {
      const [commandeData, invoiceData] = await Promise.all([
        commandeService.findById(Number(id)),
        commandeService.getRecu(Number(id)),
      ]);
      setCommande(commandeData);
      setInvoice(invoiceData);
    } catch (error) {
      console.error("Erreur lors du chargement de la commande :", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatutChange(statut: StatutCommande) {
    if (!commande) return;
    setIsUpdatingStatut(true);
    try {
      const updated = await commandeService.updateStatut(commande.id, statut);
      setCommande(updated);
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
    } finally {
      setIsUpdatingStatut(false);
    }
  }

  if (isLoading || !commande || !invoice) {
    return <p className="text-sm text-gray-400">Chargement...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate("/commandes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimer le reçu
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Reçu imprimable */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2 print:border-none print:shadow-none">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-teal-700">{invoice.magasinNom}</h2>
              <p className="text-sm text-gray-500">{invoice.magasinAdresse}</p>
              <p className="text-sm text-gray-500">{invoice.magasinTelephone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{invoice.numeroFacture}</p>
              <p className="text-xs text-gray-500">{formatDate(invoice.dateEmission)}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 border-y border-gray-100 py-4 text-sm">
            <div>
              <p className="text-xs uppercase text-gray-400">Client</p>
              <p className="font-medium text-gray-900">{invoice.clientNomComplet}</p>
              {invoice.clientTelephone && <p className="text-gray-600">{invoice.clientTelephone}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-gray-400">Vendeur</p>
              <p className="font-medium text-gray-900">{invoice.vendeurNom}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-400">
                <th className="pb-2">Article</th>
                <th className="pb-2 text-center">Qté</th>
                <th className="pb-2 text-right">Prix unit.</th>
                <th className="pb-2 text-right">Sous-total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.lignes.map((ligne, i) => (
                <tr key={i}>
                  <td className="py-2">{ligne.articleNom}</td>
                  <td className="py-2 text-center">{ligne.quantite}</td>
                  <td className="py-2 text-right">{formatCurrency(ligne.prixUnitaire)}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(ligne.sousTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto mt-4 w-56 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{formatCurrency(invoice.sousTotal)}</span>
            </div>
            {invoice.tauxTaxe > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Taxe ({(invoice.tauxTaxe * 100).toFixed(0)}%)</span>
                <span>{formatCurrency(invoice.montantTaxe)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-1 text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Panneau statut */}
        <div className="space-y-4 print:hidden">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Statut</h3>
            <Badge variant="outline" className={`mb-3 ${STATUT_BADGE_CLASSES[commande.statut]}`}>
              {STATUT_LABELS[commande.statut]}
            </Badge>

            {hasRole("GERANT") || hasRole("VENDEUR") ? (
              <Select
                value={commande.statut}
                onValueChange={(v) => handleStatutChange(v as StatutCommande)}
                disabled={isUpdatingStatut}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS.map((statut) => (
                    <SelectItem key={statut} value={statut}>
                      {STATUT_LABELS[statut]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            {isUpdatingStatut && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Mise à jour...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}