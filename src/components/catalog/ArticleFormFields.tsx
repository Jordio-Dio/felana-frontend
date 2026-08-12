import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Categorie } from "@/types/catalog.types";

export interface ArticleFormValues {
  reference: string;
  nom: string;
  description: string;
  prixVente: string;
  coutAchat: string;
  quantiteStock: string;
  seuilAlerte: string;
  imageUrl: string;
  categorieId: string;
  actif: boolean;
}

interface ArticleFormFieldsProps {
  values: ArticleFormValues;
  onChange: (values: ArticleFormValues) => void;
  categories: Categorie[];
  idPrefix: string;
  showActifToggle?: boolean;
}

/**
 * Les champs numériques sont stockés comme string dans le formulaire (pour
 * permettre un champ vide pendant la saisie) et convertis en number
 * uniquement au moment de la soumission (voir Create/EditArticleDialog).
 */
export function ArticleFormFields({
  values,
  onChange,
  categories,
  idPrefix,
  showActifToggle,
}: ArticleFormFieldsProps) {
  function update<K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-nom`}>Nom de l'article</Label>
          <Input
            id={`${idPrefix}-nom`}
            value={values.nom}
            onChange={(e) => update("nom", e.target.value)}
            placeholder="Veste en jean vintage"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-reference`}>Référence (SKU)</Label>
          <Input
            id={`${idPrefix}-reference`}
            value={values.reference}
            onChange={(e) => update("reference", e.target.value)}
            placeholder="Optionnel"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Input
          id={`${idPrefix}-description`}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Description optionnelle"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-categorie`}>Catégorie</Label>
        <Select value={values.categorieId} onValueChange={(v) => update("categorieId", v)}>
          <SelectTrigger id={`${idPrefix}-categorie`}>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-prixVente`}>Prix de vente (MGA)</Label>
          <Input
            id={`${idPrefix}-prixVente`}
            type="number"
            min="0"
            step="0.01"
            value={values.prixVente}
            onChange={(e) => update("prixVente", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-coutAchat`}>Coût d'achat (MGA)</Label>
          <Input
            id={`${idPrefix}-coutAchat`}
            type="number"
            min="0"
            step="0.01"
            value={values.coutAchat}
            onChange={(e) => update("coutAchat", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-stock`}>Quantité en stock</Label>
          <Input
            id={`${idPrefix}-stock`}
            type="number"
            min="0"
            value={values.quantiteStock}
            onChange={(e) => update("quantiteStock", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-seuil`}>Seuil d'alerte</Label>
          <Input
            id={`${idPrefix}-seuil`}
            type="number"
            min="0"
            value={values.seuilAlerte}
            onChange={(e) => update("seuilAlerte", e.target.value)}
            placeholder="3 par défaut"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-image`}>URL de l'image</Label>
        <Input
          id={`${idPrefix}-image`}
          value={values.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          placeholder="https://..."
        />
      </div>

      {showActifToggle && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
          <Label htmlFor={`${idPrefix}-actif`} className="cursor-pointer">
            Article actif (visible dans le catalogue)
          </Label>
          <Switch
            id={`${idPrefix}-actif`}
            checked={values.actif}
            onCheckedChange={(checked) => update("actif", checked)}
          />
        </div>
      )}
    </div>
  );
}