import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  ShoppingCart,
  User,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { articleService } from "@/api/articleService";
import { clientService } from "@/api/clientService";
import { commandeService } from "@/api/commandeService";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { ArticleSearchCombobox } from "@/components/orders/ArticleSearchCombobox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import type { Article } from "@/types/catalog.types";
import type { Client } from "@/types/orders.types";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";
import { notify } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CartLine {
  article: Article;
  quantite: number;
}

export function NewSalePage() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState<Article[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [remise, setRemise] = useState<string>("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRefData() {
    try {
      const [articlesPage, clientsPage] = await Promise.all([
        articleService.search({ actif: true, size: 500 }),
        clientService.findAll({ size: 200 }),
      ]);
      setArticles(articlesPage.content);
      setClients(clientsPage.content);
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
    }
  }

  useEffect(() => {
    loadRefData();
  }, []);

  const sousTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.article.prixVente * line.quantite, 0),
    [cart]
  );
  const remiseValue = parseFloat(remise) || 0;
  const total = Math.max(0, sousTotal - remiseValue);

  function addToCart(article: Article) {
    setCart((prev) => {
      const existing = prev.find((line) => line.article.id === article.id);
      if (existing) {
        return prev.map((line) =>
          line.article.id === article.id
            ? { ...line, quantite: Math.min(line.quantite + 1, article.quantiteStock) }
            : line
        );
      }
      return [...prev, { article, quantite: 1 }];
    });
  }

  function updateQuantite(articleId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.article.id === articleId
            ? {
                ...line,
                quantite: Math.max(
                  1,
                  Math.min(line.quantite + delta, line.article.quantiteStock)
                ),
              }
            : line
        )
        .filter((line) => line.quantite > 0)
    );
  }

  function removeLine(articleId: number) {
    setCart((prev) => prev.filter((line) => line.article.id !== articleId));
  }

  async function handleSubmit() {
    setError(null);

    if (remiseValue > sousTotal) {
      setError("La remise ne peut pas dépasser le total de la commande.");
      return;
    }

    if (!clientId) {
      setError("Veuillez sélectionner un client pour finaliser la vente.");
      return;
    }
    if (cart.length === 0) {
      setError("Ajoutez au moins un article au panier.");
      return;
    }

    setIsSubmitting(true);
    try {
      const commande = await commandeService.create({
        clientId: Number(clientId),
        lignes: cart.map((line) => ({
          articleId: line.article.id,
          quantite: line.quantite,
        })),
        remise: remiseValue > 0 ? remiseValue : null,
      });
      notify.success(`Vente ${commande.reference} enregistrée avec succès.`);
      navigate(`/commandes/${commande.id}`);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.error ?? "Impossible d'enregistrer cette vente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* En-tête */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-xl border-[#F2E6E1] bg-white text-stone-600 hover:bg-[#FAF6F4] hover:text-[#8B3A1C]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
              Nouvelle vente
            </h1>
            <p className="text-xs font-medium text-stone-500 sm:text-sm">
              Sélectionnez des articles et un client pour valider la transaction.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale : Recherche & Panier */}
        <div className="space-y-5 lg:col-span-2">
          {/* Recherche d'article */}
          <div className="rounded-2xl border border-[#F2E6E1] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
              Rechercher & Ajouter des articles
            </h2>
            <ArticleSearchCombobox articles={articles} onSelect={addToCart} />
          </div>

          {/* Panier d'achat */}
          <div className="overflow-hidden rounded-2xl border border-[#F2E6E1] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[#F2E6E1] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4.5 w-4.5 text-[#8B3A1C]" />
                <h2 className="text-sm font-bold text-stone-900 sm:text-base">
                  Articles sélectionnés
                </h2>
              </div>
              {cart.length > 0 && (
                <span className="rounded-full bg-[#FAF6F4] px-2.5 py-0.5 text-xs font-bold text-[#8B3A1C]">
                  {cart.reduce((sum, item) => sum + item.quantite, 0)} article
                  {cart.reduce((sum, item) => sum + item.quantite, 0) > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF6F4] text-stone-400">
                  <ShoppingCart className="h-7 w-7" />
                </div>
                <p className="text-xs font-semibold text-stone-700">
                  Le panier est vide
                </p>
                <p className="mt-1 text-[11px] text-stone-400">
                  Utilisez la recherche ci-dessus pour ajouter des produits.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F2E6E1]/60">
                {cart.map((line) => (
                  <div
                    key={line.article.id}
                    className="group flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Info Article */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-stone-900">
                        {line.article.nom}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-500">
                        <span>{formatCurrency(line.article.prixVente)} / unité</span>
                        <span>•</span>
                        <span className="text-[11px] text-stone-400">
                          Stock dispo: {line.article.quantiteStock}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      {/* Sélecteur de quantité */}
                      <div className="flex items-center gap-1 rounded-xl border border-[#F2E6E1] bg-[#FAF6F4]/50 p-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-stone-600 hover:bg-white hover:text-stone-900"
                          onClick={() => updateQuantite(line.article.id, -1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>

                        <span className="w-8 text-center text-xs font-bold text-stone-900">
                          {line.quantite}
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-stone-600 hover:bg-white hover:text-stone-900 disabled:opacity-40"
                          disabled={line.quantite >= line.article.quantiteStock}
                          onClick={() => updateQuantite(line.article.id, 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Montant total ligne */}
                      <span className="w-24 text-right text-sm font-extrabold text-stone-900">
                        {formatCurrency(line.article.prixVente * line.quantite)}
                      </span>

                      {/* Suppression */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => removeLine(line.article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale : Client & Détail du règlement */}
        <div className="space-y-5">
          {/* Sélection / Création Client */}
          <div className="rounded-2xl border border-[#F2E6E1] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#8B3A1C]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Client
                </h2>
              </div>
              <CreateClientDialog onCreated={loadRefData} />
            </div>

            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="w-full rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 font-medium text-stone-900 focus:bg-white focus:ring-[#8B3A1C]/20">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#F2E6E1]">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={String(client.id)}>
                    {client.prenom ? `${client.prenom} ` : ""}
                    {client.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Récapitulatif Financier */}
          <div className="rounded-2xl border border-[#F2E6E1] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-500">
              Récapitulatif de la vente
            </h2>

            {/* Champ Remise */}
            <div className="space-y-1.5">
              <Label
                htmlFor="remise"
                className="flex items-center gap-1.5 text-xs font-bold text-stone-700"
              >
                <Tag className="h-3.5 w-3.5 text-[#8B3A1C]" />
                Remise exceptionnelle (MGA)
              </Label>
              <Input
                id="remise"
                type="number"
                min="0"
                step="0.01"
                value={remise}
                onChange={(e) => setRemise(e.target.value)}
                placeholder="0"
                className="rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-sm font-semibold text-stone-900 focus:bg-white focus:ring-[#8B3A1C]/20"
              />
            </div>

            {/* Décompte */}
            <div className="mt-5 space-y-2.5 border-t border-[#F2E6E1] pt-4 text-xs font-medium">
              <div className="flex justify-between text-stone-500">
                <span>Sous-total</span>
                <span className="font-bold text-stone-800">
                  {formatCurrency(sousTotal)}
                </span>
              </div>

              {remiseValue > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Remise accordée</span>
                  <span className="font-bold">- {formatCurrency(remiseValue)}</span>
                </div>
              )}
            </div>

            {/* Total final */}
            <div className="mt-4 flex items-baseline justify-between border-t border-[#F2E6E1] pt-4">
              <span className="text-sm font-bold text-stone-900">Total à payer</span>
              <span className="text-2xl font-extrabold tracking-tight text-[#8B3A1C]">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Bouton de validation */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || cart.length === 0}
              className="mt-6 w-full rounded-xl bg-[#8B3A1C] py-5 font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F17] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Valider la vente
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}