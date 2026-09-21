import { useState, type FormEvent } from "react";
import { Loader2, Plus, PackagePlus, AlertCircle } from "lucide-react";
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
      {/* Bouton de déclenchement avec Framer Motion */}
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#8B3A1C] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F17] hover:shadow-lg hover:shadow-[#8B3A1C]/30 focus:outline-none focus:ring-2 focus:ring-[#8B3A1C]/40 focus:ring-offset-2"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/15 text-white transition-transform duration-200 group-hover:rotate-90">
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          </span>
          <span className="font-bold tracking-tight">Nouvel article</span>
        </motion.button>
      </DialogTrigger>

      {/* Contenu du dialogue */}
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-[#F2E6E1] p-6 shadow-2xl sm:max-w-lg">
        {/* En-tête avec icône stylisée */}
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-[#F2E6E1] pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF6F4] text-[#8B3A1C] ring-1 ring-[#8B3A1C]/10">
            <PackagePlus className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-stone-900">
              Créer un nouvel article
            </DialogTitle>
            <p className="mt-0.5 text-xs text-stone-500">
              Remplissez les détails du produit pour l'ajouter à votre catalogue.
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Formulaire des champs */}
          <ArticleFormFields
            values={values}
            onChange={setValues}
            categories={categories}
            idPrefix="create-art"
          />

          {/* Affichage des erreurs du serveur */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions du formulaire */}
          <DialogFooter className="gap-2 border-t border-[#F2E6E1] pt-4 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setOpen(false)}
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