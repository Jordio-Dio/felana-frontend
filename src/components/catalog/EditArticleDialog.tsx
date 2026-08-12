import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
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
    coutAchat: article.coutAchat !== undefined ? String(article.coutAchat) : "",
    quantiteStock: String(article.quantiteStock),
    seuilAlerte: article.seuilAlerte !== undefined ? String(article.seuilAlerte) : "",
    imageUrl: article.imageUrl ?? "",
    categorieId: String(article.categorie.id),
    actif: article.actif,
  };
}

export function EditArticleDialog({ article, categories, onOpenChange, onUpdated }: EditArticleDialogProps) {
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
        coutAchat: parseFloat(values.coutAchat),
        quantiteStock: parseInt(values.quantiteStock, 10),
        seuilAlerte: values.seuilAlerte ? parseInt(values.seuilAlerte, 10) : null,
        imageUrl: values.imageUrl || null,
        categorieId: parseInt(values.categorieId, 10),
        actif: values.actif,
      });
      onOpenChange(false);
      onUpdated();
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error ?? "Impossible de modifier cet article.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={article !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier l'article</DialogTitle>
        </DialogHeader>

        {values && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <ArticleFormFields
              values={values}
              onChange={setValues}
              categories={categories}
              idPrefix="edit-art"
              showActifToggle
            />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-700 text-white hover:bg-teal-800 sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}