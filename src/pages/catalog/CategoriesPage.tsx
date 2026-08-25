import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { categorieService } from "@/api/categorieService";
import type { Categorie, CategorieRequest } from "@/types/catalog.types";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogFooter,
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
import { PrimaryActionButton } from "@/components/shared/PrimaryActionButton";

const EMPTY_FORM: CategorieRequest = { nom: "", description: null };

export function CategoriesPage() {
    const [categories, setCategories] = useState<Categorie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
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
            notify.error("Impossible de supprimer cette catégorie (des articles y sont peut-être liés).");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Catégories</h2>
                    <p className="text-sm text-gray-500">Organisez votre catalogue par catégorie.</p>
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
                        {/* 🟡 Utilisation de PrimaryActionButton au lieu de Button */}
                        <PrimaryActionButton label="Nouvelle catégorie" />
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Créer une catégorie</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <CategorieFormFields values={createValues} onChange={setCreateValues} idPrefix="create-cat" />
                            {createError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {createError}
                                </div>
                            )}
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full bg-rose-700 text-white hover:bg-rose-800 sm:w-auto"
                                >
                                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-sm text-gray-400">
                                    Chargement...
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-sm text-gray-400">
                                    Aucune catégorie pour le moment.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">{cat.nom}</TableCell>
                                    <TableCell className="text-gray-600">{cat.description ?? "—"}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(cat)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteTarget(cat)}
                                                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={editTarget !== null} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Modifier la catégorie</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <CategorieFormFields values={editValues} onChange={setEditValues} idPrefix="edit-cat" />
                        {editError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {editError}
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isEditing}
                                className="w-full bg-rose-700 text-white hover:bg-rose-800 sm:w-auto"
                            >
                                {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget && (
                                <>
                                    Vous êtes sur le point de supprimer <strong>{deleteTarget.nom}</strong>. Les
                                    articles liés à cette catégorie devront être réaffectés.
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
        </div>
    );
}