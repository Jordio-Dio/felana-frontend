import { useCallback, useEffect, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  FolderTree,
  Plus,
  AlertCircle,
  FolderPlus,
} from "lucide-react";
import { categorieService } from "@/api/categorieService";
import type { Categorie, CategorieRequest } from "@/types/catalog.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { CategorieFormFields } from "@/components/catalog/CategorieFormFields";
import { notify } from "@/lib/toast";

const EMPTY_FORM: CategorieRequest = { nom: "", description: null };

export function CategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createValues, setCreateValues] = useState<CategorieRequest>(EMPTY_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Categorie | null>(null);
  const [editValues, setEditValues] = useState<CategorieRequest>(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Categorie | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categorieService.findAll();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories :", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);
    try {
      await categorieService.create(createValues);
      setCreateOpen(false);
      setCreateValues(EMPTY_FORM);
      loadCategories();
      notify.success("Catégorie créée avec succès.");
    } catch {
      setCreateError("Impossible de créer cette catégorie (nom peut-être déjà utilisé).");
    } finally {
      setIsCreating(false);
    }
  }

  function openEdit(categorie: Categorie) {
    setEditTarget(categorie);
    setEditValues({ nom: categorie.nom, description: categorie.description });
    setEditError(null);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditError(null);
    setIsEditing(true);
    try {
      await categorieService.update(editTarget.id, editValues);
      setEditTarget(null);
      loadCategories();
      notify.success("Catégorie modifiée avec succès.");
    } catch {
      setEditError("Impossible de modifier cette catégorie.");
    } finally {
      setIsEditing(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await categorieService.remove(deleteTarget.id);
      setDeleteTarget(null);
      loadCategories();
      notify.success("Catégorie supprimée.");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      notify.error(
        "Impossible de supprimer cette catégorie (des articles y sont peut-être liés)."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header de la page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#F2E6E1] pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Catégories
          </h2>
          <p className="text-xs text-stone-500">
            Structurez et organisez le catalogue de votre boutique.
          </p>
        </div>

        <Dialog
          open={createOpen}
          onOpenChange={(next) => {
            setCreateOpen(next);
            if (!next) {
              setCreateValues(EMPTY_FORM);
              setCreateError(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="h-10 rounded-xl bg-[#8B3A1C] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#722F17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B3A1C]">
              <Plus className="mr-1.5 h-4 w-4" />
              Nouvelle catégorie
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md rounded-2xl border-[#F2E6E1] bg-white p-6 shadow-xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base font-bold text-stone-900">
                Créer une catégorie
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <CategorieFormFields
                values={createValues}
                onChange={setCreateValues}
                idPrefix="create-cat"
              />

              {createError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  className="h-9 rounded-xl border-[#F2E6E1] text-xs text-stone-600 hover:bg-[#FAF6F4]"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="h-9 rounded-xl bg-[#8B3A1C] px-5 text-xs font-semibold text-white hover:bg-[#722F17]"
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Créer la catégorie"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grille de cartes / États de chargement */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-[#F2E6E1] bg-[#FAF6F4]/50 p-5"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#F2E6E1] bg-[#FAF6F4]/40 py-12 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#8B3A1C] shadow-sm ring-1 ring-[#8B3A1C]/10 mb-3">
            <FolderPlus className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">Aucune catégorie enregistrée</h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm">
            Commencez par ajouter des catégories pour classer plus facilement vos articles en rayon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#F2E6E1] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#8B3A1C]/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF6F4] text-[#8B3A1C] transition-colors group-hover:bg-[#8B3A1C] group-hover:text-white">
                    <FolderTree className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-stone-900 transition-colors group-hover:text-[#8B3A1C]">
                      {cat.nom}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {cat.description || "Aucune description renseignée."}
                    </p>
                  </div>
                </div>

                {/* Menu d'actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-stone-400 hover:bg-[#FAF6F4] hover:text-stone-700"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl border-[#F2E6E1] p-1 shadow-lg">
                    <DropdownMenuItem
                      onClick={() => openEdit(cat)}
                      className="rounded-lg text-xs font-medium text-stone-700 cursor-pointer focus:bg-[#FAF6F4] focus:text-stone-900"
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5 text-stone-500" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(cat)}
                      className="rounded-lg text-xs font-medium text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-700"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale d'édition */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-[#F2E6E1] bg-white p-6 shadow-xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-bold text-stone-900">
              Modifier la catégorie
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <CategorieFormFields
              values={editValues}
              onChange={setEditValues}
              idPrefix="edit-cat"
            />

            {editError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                className="h-9 rounded-xl border-[#F2E6E1] text-xs text-stone-600 hover:bg-[#FAF6F4]"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isEditing}
                className="h-9 rounded-xl bg-[#8B3A1C] px-5 text-xs font-semibold text-white hover:bg-[#722F17]"
              >
                {isEditing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl border-[#F2E6E1] bg-white p-6 shadow-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-stone-900">
              Supprimer cette catégorie ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-stone-600 leading-relaxed">
              {deleteTarget && (
                <>
                  Vous êtes sur le point de supprimer{" "}
                  <strong className="text-stone-900">{deleteTarget.nom}</strong>. Les
                  articles liés à cette catégorie devront être réaffectés avant de pouvoir procéder.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-9 rounded-xl border-[#F2E6E1] text-xs text-stone-600 hover:bg-[#FAF6F4]"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-9 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
            >
              {isDeleting ? "Suppression..." : "Confirmer la suppression"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}