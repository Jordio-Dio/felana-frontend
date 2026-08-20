import { useMemo } from "react";
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
import { ImageUploadField } from "@/components/catalog/ImageUploadField";
import { formatCurrency } from "@/lib/formatters";
import type { Categorie } from "@/types/catalog.types";

export interface ArticleFormValues {
  reference: string;
  nom: string;
  description: string;
  prixVente: string;
  coutMatiere: string;
  coutAccessoire: string;
  coutMainOeuvre: string;
  pourcentageMarge: string;
  quantiteStock: string;
  seuilAlerte: string;
  imageUrls: string[];
  publieVitrine: boolean;
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

  const coutAchatCalcule = useMemo(() => {
    const matiere = parseFloat(values.coutMatiere) || 0;
    const accessoire = parseFloat(values.coutAccessoire) || 0;
    const mainOeuvre = parseFloat(values.coutMainOeuvre) || 0;
    return matiere + accessoire + mainOeuvre;
  }, [values.coutMatiere, values.coutAccessoire, values.coutMainOeuvre]);

  const prixVenteSuggere = useMemo(() => {
    const pourcentage = parseFloat(values.pourcentageMarge);
    if (!values.pourcentageMarge || isNaN(pourcentage)) return null;
    return coutAchatCalcule * (1 + pourcentage / 100);
  }, [coutAchatCalcule, values.pourcentageMarge]);

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

      {/* Photos */}
      <div className="space-y-1.5">
        <Label>Photos de l'article</Label>
        <ImageUploadField
          imageUrls={values.imageUrls}
          onChange={(urls) => update("imageUrls", urls)}
        />
      </div>

      {/* Détail du coût de revient */}
      <div className="rounded-lg border border-gray-200 p-3">
        <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Coût de revient</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-coutMatiere`}>Matière</Label>
            <Input
              id={`${idPrefix}-coutMatiere`}
              type="number"
              min="0"
              step="0.01"
              value={values.coutMatiere}
              onChange={(e) => update("coutMatiere", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-coutAccessoire`}>Accessoire</Label>
            <Input
              id={`${idPrefix}-coutAccessoire`}
              type="number"
              min="0"
              step="0.01"
              value={values.coutAccessoire}
              onChange={(e) => update("coutAccessoire", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-coutMainOeuvre`}>Main d'œuvre</Label>
            <Input
              id={`${idPrefix}-coutMainOeuvre`}
              type="number"
              min="0"
              step="0.01"
              value={values.coutMainOeuvre}
              onChange={(e) => update("coutMainOeuvre", e.target.value)}
              required
            />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Coût total : <span className="font-semibold">{formatCurrency(coutAchatCalcule)}</span>
        </p>
      </div>

      {/* Marge et prix suggéré */}
      <div className="rounded-lg border border-gray-200 p-3">
        <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Marge souhaitée (optionnel)</p>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-marge`}>Pourcentage de bénéfice (%)</Label>
          <Input
            id={`${idPrefix}-marge`}
            type="number"
            min="0"
            step="1"
            value={values.pourcentageMarge}
            onChange={(e) => update("pourcentageMarge", e.target.value)}
            placeholder="Ex : 50"
          />
        </div>
        {prixVenteSuggere !== null && (
          <p className="mt-2 text-sm text-teal-700">
            Prix de vente suggéré : <span className="font-semibold">{formatCurrency(prixVenteSuggere)}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-prixVente`}>Prix de vente final (MGA)</Label>
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

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
          <div>
            <Label htmlFor={`${idPrefix}-vitrine`} className="cursor-pointer">
              Publier sur la vitrine en ligne
            </Label>
            <p className="text-xs text-gray-400">Visible par vos clients sur la boutique publique.</p>
          </div>
          <Switch
            id={`${idPrefix}-vitrine`}
            checked={values.publieVitrine}
            onCheckedChange={(checked) => update("publieVitrine", checked)}
          />
        </div>

        {showActifToggle && (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <Label htmlFor={`${idPrefix}-actif`} className="cursor-pointer">
              Article actif (visible en interne)
            </Label>
            <Switch
              id={`${idPrefix}-actif`}
              checked={values.actif}
              onCheckedChange={(checked) => update("actif", checked)}
            />
          </div>
        )}
      </div>
    </div>
  );
}