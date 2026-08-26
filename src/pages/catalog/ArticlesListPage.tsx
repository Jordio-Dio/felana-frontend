import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, MoreHorizontal, AlertTriangle, Package, Search } from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState<string>(isGerant ? ALL_STATUS : "true");

  const [editTarget, setEditTarget] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await articleService.search({
        size: 200,
        terme: debouncedSearch || undefined,
        categorieId: categorieFilter !== ALL_CATEGORIES ? Number(categorieFilter) : undefined,
        actif: statusFilter !== ALL_STATUS ? statusFilter === "true" : undefined,
      });
      setArticles(page.content);
    } catch (error) {
      console.error("Erreur lors du chargement des articles :", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, categorieFilter, statusFilter]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

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
      notify.success("Article supprimé.");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      notify.error("Impossible de supprimer cet article.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Articles</h2>
          <p className="text-sm text-gray-500">Catalogue des produits disponibles à la vente.</p>
        </div>
        {isGerant && <CreateArticleDialog categories={categories} onCreated={loadArticles} />}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="rounded-full pl-9"
          />
        </div>

        <Select value={categorieFilter} onValueChange={setCategorieFilter}>
          <SelectTrigger className="w-full rounded-full sm:w-48">
            <SelectValue placeholder="Toutes catégories" />
          </SelectTrigger>
          <SelectContent>
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
            <SelectTrigger className="w-full rounded-full sm:w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUS}>Tous statuts</SelectItem>
              <SelectItem value="true">Actifs</SelectItem>
              <SelectItem value="false">Inactifs</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-400">Chargement...</p>
        ) : articles.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">Aucun article ne correspond à votre recherche.</p>
        ) : (
          articles.map((article) => (
            <ListItemCard
              key={article.id}
              leading={
                article.imageUrls.length > 0 ? (
                  <img
                    src={article.imageUrls[0]}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-400">
                    <Package className="h-5 w-5" />
                  </div>
                )
              }
              title={article.nom}
              subtitle={article.reference ? `Réf. ${article.reference}` : undefined}
              fields={[
                { label: "Catégorie", value: article.categorie.nom },
                { label: "Prix de vente", value: formatCurrency(article.prixVente) },
                ...(isGerant
                  ? [
                      {
                        label: "Coût / Marge",
                        value: (
                          <span>
                            {article.coutAchat !== undefined ? formatCurrency(article.coutAchat) : "—"}
                            {article.marge !== undefined && (
                              <span className="ml-1 text-xs text-emerald-600">
                                (+{formatCurrency(article.marge)})
                              </span>
                            )}
                          </span>
                        ),
                      },
                    ]
                  : []),
                {
                  label: "Stock",
                  value: (
                    <span className="flex items-center gap-1">
                      {article.quantiteStock}
                      {isGerant && article.stockBas && (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-label="Stock bas" />
                      )}
                    </span>
                  ),
                },
              ]}
              trailing={
                isGerant ? (
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge label={article.actif ? "Actif" : "Inactif"} tone={article.actif ? "rose" : "gray"} />
                    {article.publieVitrine && <StatusBadge label="En vitrine" tone="pink" />}
                  </div>
                ) : undefined
              }
              actions={
                isGerant ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditTarget(article)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(article)}
                        className="text-red-600 focus:bg-red-50 focus:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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

          <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteTarget && (
                    <>
                      Vous êtes sur le point de supprimer <strong>{deleteTarget.nom}</strong>. Cette
                      action est irréversible.
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

/*
// Animation en cascade pour le conteneur
const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};*/
