import { useCallback, useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  Package,
  Search,
  Layers,
  
} from "lucide-react";
import { articleService } from "@/api/articleService";
import { categorieService } from "@/api/categorieService";
import { useAuth } from "@/context/AuthContext";
import type { Article, Categorie } from "@/types/catalog.types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CreateArticleDialog } from "@/components/catalog/CreateArticleDialog";
import { EditArticleDialog } from "@/components/catalog/EditArticleDialog";
import { formatCurrency } from "@/lib/formatters";
import { notify } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ALL_CATEGORIES = "ALL";
const ALL_STATUS = "ALL";

export function ArticlesListPage() {
  const { user } = useAuth();
  const isGerant = user?.role === "GERANT";

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<string>(ALL_CATEGORIES);
  const [statusFilter, setStatusFilter] = useState<string>(
    isGerant ? ALL_STATUS : "true"
  );

  const [editTarget, setEditTarget] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const [refreshKey, setRefreshKey] = useState(0);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await articleService.search({
        size: 200,
        terme: debouncedSearch || undefined,
        categorieId:
          categorieFilter !== ALL_CATEGORIES ? Number(categorieFilter) : undefined,
        actif: statusFilter !== ALL_STATUS ? statusFilter === "true" : undefined,
      });
      setArticles(
        [...page.content].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Erreur lors du chargement des articles :", error);
      notify.error("Impossible de charger les articles.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, categorieFilter, statusFilter]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles, refreshKey]);

  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1);
    window.addEventListener("invalidate-cache", handler);
    return () => window.removeEventListener("invalidate-cache", handler);
  }, []);

  useEffect(() => {
    categorieService.findAll().then(setCategories).catch(console.error);
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await articleService.remove(deleteTarget.id);
      setDeleteTarget(null);
      loadArticles();
      notify.success("Article supprimé avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      notify.error("Impossible de supprimer cet article.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* En-tête de la page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Articles & Catalogues
          </h1>
          <p className="mt-0.5 text-xs font-medium text-stone-500 sm:text-sm">
            Gestion des produits, des prix de vente et des niveaux de stock.
          </p>
        </div>
        {isGerant && (
          <CreateArticleDialog categories={categories} onCreated={loadArticles} />
        )}
      </div>

      {/* Barre d'outils, Recherche & Filtres */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#F2E6E1] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, référence..."
            className="rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-10 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:bg-white focus:ring-[#8B3A1C]/20"
          />
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <Select value={categorieFilter} onValueChange={setCategorieFilter}>
            <SelectTrigger className="w-full rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs font-medium text-stone-800 focus:bg-white focus:ring-[#8B3A1C]/20 sm:w-48">
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#F2E6E1]">
              <SelectItem value={ALL_CATEGORIES}>Toutes catégories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isGerant && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs font-medium text-stone-800 focus:bg-white focus:ring-[#8B3A1C]/20 sm:w-36">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#F2E6E1]">
                <SelectItem value={ALL_STATUS}>Tous statuts</SelectItem>
                <SelectItem value="true">Actifs</SelectItem>
                <SelectItem value="false">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Liste des articles */}
      <div className="space-y-3">
        {isLoading ? (
          /* Squelettes de chargement */
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-[#F2E6E1]/60 bg-white p-4 shadow-sm"
              >
                <Skeleton className="h-12 w-12 rounded-xl bg-stone-100" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3 bg-stone-200" />
                  <Skeleton className="h-3 w-1/4 bg-stone-100" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full bg-stone-100" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          /* Aucun résultat */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#F2E6E1] bg-white/60 py-12 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF6F4] text-[#8B3A1C]">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">
              Aucun article trouvé
            </h3>
            <p className="mt-1 text-xs text-stone-400">
              {debouncedSearch || categorieFilter !== ALL_CATEGORIES
                ? "Ajustez vos filtres de recherche pour trouver ce que vous cherchez."
                : "Commencez par ajouter de nouveaux articles à votre catalogue."}
            </p>
          </div>
        ) : (
          /* Liste des cartes d'articles */
          articles.map((article) => (
            <ListItemCard
              key={article.id}
              leading={
                article.imageUrls.length > 0 ? (
                  <img
                    src={article.imageUrls[0]}
                    alt={article.nom}
                    className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-[#F2E6E1]"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF6F4] text-[#8B3A1C] ring-1 ring-[#8B3A1C]/10">
                    <Package className="h-6 w-6" />
                  </div>
                )
              }
              title={
                <span className="text-sm font-bold text-stone-900">
                  {article.nom}
                </span>
              }
              subtitle={
                article.reference ? (
                  <span className="font-mono text-[11px] text-stone-400">
                    Réf. {article.reference}
                  </span>
                ) : undefined
              }
              fields={[
                {
                  label: "Catégorie",
                  value: (
                    <span className="inline-flex items-center gap-1 font-medium text-stone-600">
                      <Layers className="h-3 w-3 text-stone-400" />
                      {article.categorie.nom}
                    </span>
                  ),
                },
                {
                  label: "Prix de vente",
                  value: (
                    <span className="font-bold text-[#8B3A1C]">
                      {formatCurrency(article.prixVente)}
                    </span>
                  ),
                },
                ...(isGerant
                  ? [
                      {
                        label: "Coût / Marge",
                        value: (
                          <div className="min-w-0">
                            <p className="font-medium text-stone-700">
                              {article.coutAchat !== undefined
                                ? formatCurrency(article.coutAchat)
                                : "—"}
                            </p>
                            {article.marge !== undefined && (
                              <p className="truncate text-[11px] font-semibold text-emerald-600">
                                + {formatCurrency(article.marge)}
                              </p>
                            )}
                          </div>
                        ),
                      },
                    ]
                  : []),
                {
                  label: "Stock",
                  value: (
                    <span className="inline-flex items-center gap-1.5 font-bold text-stone-800">
                      {article.quantiteStock}
                      {isGerant && article.stockBas && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center rounded-md bg-amber-50 p-1 text-amber-600 ring-1 ring-amber-500/20">
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg bg-amber-900 text-xs text-white">
                            Stock bas
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </span>
                  ),
                },
              ]}
              trailing={
                isGerant ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge
                      label={article.actif ? "Actif" : "Inactif"}
                      tone={article.actif ? "emerald" : "stone"}
                    />
                    {article.publieVitrine && (
                      <StatusBadge label="Vitrine" tone="amber" />
                    )}
                  </div>
                ) : undefined
              }
              actions={
                isGerant ? (
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-[#FAF6F4] hover:text-[#8B3A1C]">
                            <MoreHorizontal className="h-4.5 w-4.5" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-lg bg-stone-900 text-xs font-medium text-white">
                        Actions
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 rounded-xl border-[#F2E6E1] p-1 shadow-lg"
                    >
                      <DropdownMenuItem
                        onClick={() => setEditTarget(article)}
                        className="rounded-lg text-xs font-semibold text-stone-700 hover:bg-[#FAF6F4] hover:text-[#8B3A1C]"
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(article)}
                        className="rounded-lg text-xs font-semibold text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : undefined
              }
            />
          ))
        )}
      </div>

      {/* Modales d'édition et de confirmation de suppression */}
      {isGerant && (
        <>
          <EditArticleDialog
            article={editTarget}
            categories={categories}
            onOpenChange={(open) => {
              if (!open) setEditTarget(null);
            }}
            onUpdated={loadArticles}
          />

          <AlertDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
          >
            <AlertDialogContent className="rounded-3xl border-[#F2E6E1] p-6">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base font-bold text-stone-900">
                  Supprimer cet article ?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-stone-500">
                  {deleteTarget && (
                    <>
                      Vous êtes sur le point de retirer définitivement{" "}
                      <strong className="text-stone-800">{deleteTarget.nom}</strong> du catalogue.
                      Cette action est irréversible.
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4 gap-2">
                <AlertDialogCancel
                  disabled={isDeleting}
                  className="rounded-xl border-[#F2E6E1] text-xs font-semibold text-stone-700 hover:bg-[#FAF6F4]"
                >
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  {isDeleting ? "Suppression en cours..." : "Confirmer la suppression"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}