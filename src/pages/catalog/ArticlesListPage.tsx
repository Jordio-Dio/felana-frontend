import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Search, Trash2, AlertTriangle } from "lucide-react";
import { articleService } from "@/api/articleService";
import { categorieService } from "@/api/categorieService";
import { useAuth } from "@/context/AuthContext";
import type { Article, Categorie } from "@/types/catalog.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { CreateArticleDialog } from "@/components/catalog/CreateArticleDialog";
import { EditArticleDialog } from "@/components/catalog/EditArticleDialog";
import { formatCurrency } from "@/lib/formatters";

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

  // Debounce simple : évite un appel réseau à chaque frappe.
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
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
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

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article..."
              className="pl-9"
            />
          </div>

          <Select value={categorieFilter} onValueChange={setCategorieFilter}>
            <SelectTrigger className="w-full sm:w-48">
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
              <SelectTrigger className="w-full sm:w-40">
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix de vente</TableHead>
                {isGerant && <TableHead>Coût / Marge</TableHead>}
                <TableHead>Stock</TableHead>
                {isGerant && <TableHead>Statut</TableHead>}
                {isGerant && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-400">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-400">
                    Aucun article ne correspond à votre recherche.
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="font-medium">{article.nom}</div>
                      {article.reference && (
                        <div className="text-xs text-gray-400">Réf. {article.reference}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">{article.categorie.nom}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(article.prixVente)}</TableCell>
                    {isGerant && (
                      <TableCell className="text-gray-600">
                        {article.coutAchat !== undefined ? formatCurrency(article.coutAchat) : "—"}
                        {article.marge !== undefined && (
                          <span className="ml-1 text-xs text-emerald-600">
                            (+{formatCurrency(article.marge)})
                          </span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {article.quantiteStock}
                        {isGerant && article.stockBas && (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-label="Stock bas" />
                        )}
                      </div>
                    </TableCell>
                    {isGerant && (
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            article.actif
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-50 text-gray-500 border-gray-200"
                          }
                        >
                          {article.actif ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                    )}
                    {isGerant && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
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
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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