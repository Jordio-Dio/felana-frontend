import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Loader2, Store, User, FileText, CheckCircle2 } from "lucide-react";
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
import { notify } from "@/lib/toast";

const STATUTS: StatutCommande[] = ["EN_ATTENTE", "EN_FABRICATION", "PAYEE", "LIVREE", "ANNULEE"];

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
      notify.error("Impossible de charger les détails de cette commande.");
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
      notify.success(`Statut mis à jour : ${STATUT_LABELS[statut]}.`);
      if (statut === "PAYEE") {
        window.dispatchEvent(new CustomEvent("invalidate-cache"));
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
      notify.error("Impossible de mettre à jour le statut.");
    } finally {
      setIsUpdatingStatut(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded-xl bg-stone-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-3xl bg-stone-100 lg:col-span-2" />
          <div className="h-48 animate-pulse rounded-3xl bg-stone-100" />
        </div>
      </div>
    );
  }

  if (!commande || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#F2E6E1] bg-white p-12 text-center">
        <FileText className="mb-3 h-10 w-10 text-stone-400" />
        <h2 className="text-base font-bold text-stone-800">Commande introuvable</h2>
        <p className="mt-1 text-xs text-stone-500">
          La commande demandée n'existe pas ou a été supprimée.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/commandes")}
          className="mt-4 rounded-xl border-[#F2E6E1] text-xs font-semibold text-stone-700 hover:bg-[#FAF6F4]"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          Retour aux commandes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Barre d'action supérieure */}
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/commandes")}
          className="rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#FAF6F4] hover:text-[#8B3A1C]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux commandes
        </Button>

        <Button
          onClick={() => window.print()}
          size="sm"
          className="rounded-xl bg-[#8B3A1C] font-semibold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F17]"
        >
          <Printer className="mr-2 h-4 w-4" />
          Imprimer le reçu
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Reçu imprimable / Facture */}
        <div className="rounded-3xl border border-[#F2E6E1] bg-white p-6 shadow-xl shadow-[#8B3A1C]/5 lg:col-span-2 sm:p-8 print:border-none print:p-0 print:shadow-none">
          {/* En-tête du reçu */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#F2E6E1] pb-6 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-[#8B3A1C] print:text-black" />
                <h2 className="text-lg font-extrabold text-stone-900 sm:text-xl print:text-black">
                  {invoice.magasinNom}
                </h2>
              </div>
              <p className="mt-1 text-xs text-stone-500 print:text-stone-700">
                {invoice.magasinAdresse}
              </p>
              <p className="text-xs text-stone-500 print:text-stone-700">
                Tél: {invoice.magasinTelephone}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block rounded-lg bg-[#FAF6F4] px-3 py-1 font-mono text-xs font-bold text-[#8B3A1C] print:border print:bg-transparent print:text-black">
                {invoice.numeroFacture}
              </span>
              <p className="mt-1 text-xs font-medium text-stone-500 print:text-stone-700">
                Date: {formatDate(invoice.dateEmission)}
              </p>
            </div>
          </div>

          {/* Informations Client & Vendeur */}
          <div className="my-6 grid grid-cols-2 gap-4 rounded-2xl bg-[#FAF6F4]/60 p-4 text-xs print:border print:border-stone-200 print:bg-transparent">
            <div>
              <p className="font-bold uppercase tracking-wider text-stone-400">Client</p>
              <p className="mt-0.5 font-bold text-stone-900 print:text-black">
                {invoice.clientNomComplet}
              </p>
              {invoice.clientTelephone && (
                <p className="text-stone-500 print:text-stone-700">{invoice.clientTelephone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold uppercase tracking-wider text-stone-400">Vendeur</p>
              <p className="mt-0.5 font-bold text-stone-900 print:text-black">
                {invoice.vendeurNom}
              </p>
            </div>
          </div>

          {/* Tableau des articles */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F2E6E1] text-left font-bold uppercase tracking-wider text-stone-400">
                  <th className="pb-3">Article</th>
                  <th className="pb-3 text-center">Qté</th>
                  <th className="pb-3 text-right">Prix unit.</th>
                  <th className="pb-3 text-right">Sous-total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2E6E1]/60">
                {invoice.lignes.map((ligne, i) => (
                  <tr key={i} className="hover:bg-[#FAF6F4]/30 print:hover:bg-transparent">
                    <td className="py-3 font-semibold text-stone-800 print:text-black">
                      {ligne.articleNom}
                    </td>
                    <td className="py-3 text-center font-bold text-stone-700 print:text-black">
                      {ligne.quantite}
                    </td>
                    <td className="py-3 text-right text-stone-600 print:text-black">
                      {formatCurrency(ligne.prixUnitaire)}
                    </td>
                    <td className="py-3 text-right font-extrabold text-stone-900 print:text-black">
                      {formatCurrency(ligne.sousTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total & Décompte */}
          <div className="ml-auto mt-6 w-full max-w-xs space-y-2 border-t border-[#F2E6E1] pt-4 text-xs font-medium">
            <div className="flex justify-between text-stone-500">
              <span>Sous-total</span>
              <span className="font-bold text-stone-800">{formatCurrency(invoice.sousTotal)}</span>
            </div>

            {invoice.remise > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Remise</span>
                <span className="font-bold">- {formatCurrency(invoice.remise)}</span>
              </div>
            )}

            {invoice.tauxTaxe > 0 && (
              <div className="flex justify-between text-stone-500">
                <span>Taxe ({(invoice.tauxTaxe * 100).toFixed(0)}%)</span>
                <span>{formatCurrency(invoice.montantTaxe)}</span>
              </div>
            )}

            <div className="flex items-baseline justify-between border-t border-[#F2E6E1] pt-3 text-sm font-extrabold text-stone-900">
              <span>Total Règlement</span>
              <span className="text-lg text-[#8B3A1C] print:text-black">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Panneau de gestion du statut (masqué à l'impression) */}
        <div className="space-y-4 print:hidden">
          <div className="rounded-3xl border border-[#F2E6E1] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
              Suivi du statut
            </h3>

            <div className="mb-4">
              <Badge
                variant="outline"
                className={`px-3 py-1 text-xs font-bold ${STATUT_BADGE_CLASSES[commande.statut]}`}
              >
                {STATUT_LABELS[commande.statut]}
              </Badge>
            </div>

            {hasRole("GERANT") || hasRole("VENDEUR") ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-600">
                  Modifier le statut
                </label>
                <Select
                  value={commande.statut}
                  onValueChange={(v) => handleStatutChange(v as StatutCommande)}
                  disabled={isUpdatingStatut}
                >
                  <SelectTrigger className="w-full rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 font-semibold text-stone-800 focus:bg-white focus:ring-[#8B3A1C]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#F2E6E1]">
                    {STATUTS.map((statut) => (
                      <SelectItem key={statut} value={statut}>
                        {STATUT_LABELS[statut]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {isUpdatingStatut && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#8B3A1C]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Mise à jour du statut...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}