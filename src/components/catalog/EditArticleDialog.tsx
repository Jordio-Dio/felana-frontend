import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Edit3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArticleFormFields, type ArticleFormValues } from "@/components/catalog/ArticleFormFields";
import { articleService } from "@/api/articleService";
import { notify } from "@/lib/toast";
import type { Article, Categorie } from "@/types/catalog.types";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

interface EditArticleDialogProps {
  article: Article | null;
  categories: Categorie[];
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

function toFormValues(article: Article): ArticleFormValues {
  return {
    reference: article.reference ?? "",
    nom: article.nom,
    description: article.description ?? "",
    prixVente: String(article.prixVente),
    coutMatiere: article.coutMatiere !== undefined ? String(article.coutMatiere) : "0",
    coutAccessoire: article.coutAccessoire !== undefined ? String(article.coutAccessoire) : "0",
    coutMainOeuvre: article.coutMainOeuvre !== undefined ? String(article.coutMainOeuvre) : "0",
    pourcentageMarge:
      article.pourcentageMarge !== undefined && article.pourcentageMarge !== null
        ? String(article.pourcentageMarge * 100)
        : "",
    quantiteStock: String(article.quantiteStock),
    seuilAlerte: article.seuilAlerte !== undefined ? String(article.seuilAlerte) : "",
    imageUrls: article.imageUrls ?? [],
    publieVitrine: article.publieVitrine ?? false,
    categorieId: String(article.categorie.id),
    actif: article.actif,
  };
}

export function EditArticleDialog({
  article,
  categories,
  onOpenChange,
  onUpdated,
}: EditArticleDialogProps) {
  const [values, setValues] = useState<ArticleFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (article) {
      setValues(toFormValues(article));
      setError(null);
    }
  }, [article]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!article || !values) return;

    setError(null);
    setIsLoading(true);

    try {
      await articleService.update(article.id, {
        reference: values.reference || null,
        nom: values.nom,
        description: values.description || null,
        prixVente: parseFloat(values.prixVente),
        coutMatiere: parseFloat(values.coutMatiere) || 0,
        coutAccessoire: parseFloat(values.coutAccessoire) || 0,
        coutMainOeuvre: parseFloat(values.coutMainOeuvre) || 0,
        pourcentageMarge: values.pourcentageMarge
          ? parseFloat(values.pourcentageMarge) / 100
          : null,
        quantiteStock: parseInt(values.quantiteStock, 10),
        seuilAlerte: values.seuilAlerte ? parseInt(values.seuilAlerte, 10) : null,
        imageUrls: values.imageUrls,
        publieVitrine: values.publieVitrine,
        categorieId: parseInt(values.categorieId, 10),
        actif: values.actif,
      });
      onOpenChange(false);
      onUpdated();
      notify.success("Article modifié avec succès.");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error ?? "Impossible de modifier cet article.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={article !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-[#F2E6E1] p-6 shadow-2xl sm:max-w-lg">
        {/* En-tête de la modale */}
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-[#F2E6E1] pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF6F4] text-[#8B3A1C] ring-1 ring-[#8B3A1C]/10">
            <Edit3 className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-stone-900">
              Modifier l'article
            </DialogTitle>
            <p className="mt-0.5 text-xs text-stone-500">
              Ajustez les tarifs, la catégorie ou les paramètres de stock du produit.
            </p>
          </div>
        </DialogHeader>

        {values && (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Formulaire complet */}
            <ArticleFormFields
              values={values}
              onChange={setValues}
              categories={categories}
              idPrefix="edit-art"
              showActifToggle
            />

            {/* Notification d'erreur */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs font-medium text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Pied de page et boutons */}
            <DialogFooter className="gap-2 border-t border-[#F2E6E1] pt-4 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
                className="rounded-xl border-[#F2E6E1] text-xs font-semibold text-stone-700 hover:bg-[#FAF6F4]"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-[#8B3A1C] text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#722F17]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}