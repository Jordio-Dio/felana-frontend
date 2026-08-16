import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, Loader2, ShoppingCart } from "lucide-react";
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
                        ? { ...line, quantite: Math.max(1, Math.min(line.quantite + delta, line.article.quantiteStock)) }
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
            setError("Veuillez sélectionner un client.");
            return;
        }
        if (cart.length === 0) {
            setError("Ajoutez au moins un article à la vente.");
            return;
        }

        setIsSubmitting(true);
        try {
            const commande = await commandeService.create({
                clientId: Number(clientId),
                lignes: cart.map((line) => ({ articleId: line.article.id, quantite: line.quantite })),
                remise: remiseValue > 0 ? remiseValue : null,
            });
            notify.success(`Vente ${commande.reference} enregistrée.`);
            navigate(`/commandes/${commande.id}`);
        } catch (err) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            setError(axiosError.response?.data?.error ?? "Impossible d'enregistrer cette vente.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Colonne principale : sélection article + panier */}
            <div className="space-y-4 lg:col-span-2">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <h2 className="mb-3 text-sm font-semibold text-gray-900">Ajouter des articles</h2>
                    <ArticleSearchCombobox articles={articles} onSelect={addToCart} />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <h2 className="mb-3 text-sm font-semibold text-gray-900">Panier</h2>

                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-gray-400">
                            <ShoppingCart className="mb-2 h-8 w-8 text-gray-300" />
                            Aucun article ajouté pour le moment.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {cart.map((line) => (
                                <div key={line.article.id} className="flex items-center justify-between gap-3 py-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900">{line.article.nom}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatCurrency(line.article.prixVente)} / unité
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => updateQuantite(line.article.id, -1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-6 text-center text-sm font-medium">{line.quantite}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            disabled={line.quantite >= line.article.quantiteStock}
                                            onClick={() => updateQuantite(line.article.id, 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <span className="w-24 text-right text-sm font-semibold text-gray-900">
                                        {formatCurrency(line.article.prixVente * line.quantite)}
                                    </span>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => removeLine(line.article.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Colonne latérale : client + récapitulatif */}
            <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">Client</h2>
                        <CreateClientDialog onCreated={loadRefData} />
                    </div>
                    <Select value={clientId} onValueChange={setClientId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={String(client.id)}>
                                    {client.prenom ? `${client.prenom} ` : ""}
                                    {client.nom}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <h2 className="mb-3 text-sm font-semibold text-gray-900">Récapitulatif</h2>

                    <div className="space-y-1.5">
                        <Label htmlFor="remise">Remise (MGA)</Label>
                        <Input
                            id="remise"
                            type="number"
                            min="0"
                            step="0.01"
                            value={remise}
                            onChange={(e) => setRemise(e.target.value)}
                            placeholder="0"
                        />
                    </div>

                    <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Sous-total</span>
                            <span>{formatCurrency(sousTotal)}</span>
                        </div>
                        {remiseValue > 0 && (
                            <div className="flex justify-between text-red-600">
                                <span>Remise</span>
                                <span>- {formatCurrency(remiseValue)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>

                    {error && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="mt-4 w-full bg-teal-700 text-white hover:bg-teal-800"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            "Valider la vente"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}