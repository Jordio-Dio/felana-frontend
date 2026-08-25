import { useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArticleFormFields, type ArticleFormValues } from "@/components/catalog/ArticleFormFields";
import { articleService } from "@/api/articleService";
import { notify } from "@/lib/toast";
import type { Categorie } from "@/types/catalog.types";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const EMPTY_FORM: ArticleFormValues = {
  reference: "",
  nom: "",
  description: "",
  prixVente: "",
  coutMatiere: "",
  coutAccessoire: "",
  coutMainOeuvre: "",
  pourcentageMarge: "",
  quantiteStock: "",
  seuilAlerte: "",
  imageUrls: [],
  publieVitrine: false,
  categorieId: "",
  actif: true,
};

interface CreateArticleDialogProps {
  categories: Categorie[];
  onCreated: () => void;
}

export function CreateArticleDialog({ categories, onCreated }: CreateArticleDialogProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ArticleFormValues>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.categorieId) {
      setError("Veuillez sélectionner une catégorie.");
      return;
    }

    setIsLoading(true);
    try {
      await articleService.create({
        reference: values.reference || null,
        nom: values.nom,
        description: values.description || null,
        prixVente: parseFloat(values.prixVente),
        coutMatiere: parseFloat(values.coutMatiere) || 0,
        coutAccessoire: parseFloat(values.coutAccessoire) || 0,
        coutMainOeuvre: parseFloat(values.coutMainOeuvre) || 0,
        // Conversion pourcentage lisible (50) -> décimal attendu par le backend (0.5)
        pourcentageMarge: values.pourcentageMarge
          ? parseFloat(values.pourcentageMarge) / 100
          : null,
        quantiteStock: parseInt(values.quantiteStock, 10),
        seuilAlerte: values.seuilAlerte ? parseInt(values.seuilAlerte, 10) : null,
        imageUrls: values.imageUrls,
        publieVitrine: values.publieVitrine,
        categorieId: parseInt(values.categorieId, 10),
      });
      setOpen(false);
      setValues(EMPTY_FORM);
      onCreated();
      notify.success("Article créé avec succès.");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error ?? "Impossible de créer cet article.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setValues(EMPTY_FORM);
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-1.5 text-sm font-semibold text-rose-950",
            // Dégradé de fond rose bonbon glossy
            "bg-gradient-to-b from-pink-200 via-pink-300 to-rose-300",
            // Bordure fine rosée et ombre portée rose douce
            "border border-pink-300/80 shadow-md shadow-pink-400/40 transition-all hover:shadow-lg hover:shadow-pink-400/60",
            "focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          )}
        >
          {/* Reflet brillant sur la moitié supérieure (Effet Glossy) */}
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent" />

          <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-pink-400/30 text-rose-900">
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          </span>
          <span className="relative z-10 font-bold tracking-tight text-rose-900">
            Nouvel article
          </span>
        </motion.button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer un article</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ArticleFormFields
            values={values}
            onChange={setValues}
            categories={categories}
            idPrefix="create-art"
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
              className="w-full bg-rose-700 text-white hover:bg-rose-800 sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'article"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}