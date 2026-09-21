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
import { Calculator, Sparkles, Store, CheckCircle2 } from "lucide-react";

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
  function update<K extends keyof ArticleFormValues>(
    key: K,
    value: ArticleFormValues[K]
  ) {
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
    <div className="space-y-5">
      {/* Informations de base */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor={`${idPrefix}-nom`}
              className="text-xs font-semibold text-stone-700"
            >
              Nom de l'article <span className="text-[#8B3A1C]">*</span>
            </Label>
            <Input
              id={`${idPrefix}-nom`}
              value={values.nom}
              onChange={(e) => update("nom", e.target.value)}
              placeholder="ex: Veste en jean vintage"
              required
              className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:bg-white focus:ring-1 focus:ring-[#8B3A1C]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor={`${idPrefix}-reference`}
                className="text-xs font-semibold text-stone-700"
              >
                Référence (SKU)
              </Label>
              <span className="text-[10px] font-medium text-stone-400">Optionnel</span>
            </div>
            <Input
              id={`${idPrefix}-reference`}
              value={values.reference}
              onChange={(e) => update("reference", e.target.value)}
              placeholder="ex: VST-2026-001"
              className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:bg-white focus:ring-1 focus:ring-[#8B3A1C]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor={`${idPrefix}-categorie`}
              className="text-xs font-semibold text-stone-700"
            >
              Catégorie <span className="text-[#8B3A1C]">*</span>
            </Label>
            <Select
              value={values.categorieId}
              onValueChange={(v) => update("categorieId", v)}
            >
              <SelectTrigger
                id={`${idPrefix}-categorie`}
                className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs text-stone-900 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C]"
              >
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#F2E6E1]">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)} className="text-xs">
                    {cat.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor={`${idPrefix}-description`}
                className="text-xs font-semibold text-stone-700"
              >
                Description
              </Label>
              <span className="text-[10px] font-medium text-stone-400">Optionnel</span>
            </div>
            <Input
              id={`${idPrefix}-description`}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Brève description..."
              className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:bg-white focus:ring-1 focus:ring-[#8B3A1C]"
            />
          </div>
        </div>
      </div>

      {/* Galerie de photos */}
      <div className="space-y-1.5 border-t border-[#F2E6E1] pt-4">
        <Label className="text-xs font-semibold text-stone-700">Photos de l'article</Label>
        <ImageUploadField
          imageUrls={values.imageUrls}
          onChange={(urls) => update("imageUrls", urls)}
        />
      </div>

      {/* Détail du coût de revient */}
      <div className="rounded-2xl border border-[#F2E6E1] bg-[#FAF6F4]/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-stone-800">
            <Calculator className="h-4 w-4 text-[#8B3A1C]" />
            <span className="text-xs font-bold uppercase tracking-wide">Coût de revient</span>
          </div>
          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#8B3A1C] shadow-sm ring-1 ring-[#8B3A1C]/10">
            Total : {formatCurrency(coutAchatCalcule)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-coutMatiere`} className="text-[11px] font-medium text-stone-600">
              Matière
            </Label>
            <Input
              id={`${idPrefix}-coutMatiere`}
              type="number"
              min="0"
              step="0.01"
              value={values.coutMatiere}
              onChange={(e) => update("coutMatiere", e.target.value)}
              placeholder="0"
              required
              className="h-9 rounded-xl border-[#F2E6E1] bg-white text-xs text-stone-900 focus:border-[#8B3A1C]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-coutAccessoire`} className="text-[11px] font-medium text-stone-600">
              Accessoire
            </Label>
            <Input
              id={`${idPrefix}-coutAccessoire`}
              type="number"
              min="0"
              step="0.01"
              value={values.coutAccessoire}
              onChange={(e) => update("coutAccessoire", e.target.value)}
              placeholder="0"
              required
              className="h-9 rounded-xl border-[#F2E6E1] bg-white text-xs text-stone-900 focus:border-[#8B3A1C]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-coutMainOeuvre`} className="text-[11px] font-medium text-stone-600">
              Main d'œuvre
            </Label>
            <Input
              id={`${idPrefix}-coutMainOeuvre`}
              type="number"
              min="0"
              step="0.01"
              value={values.coutMainOeuvre}
              onChange={(e) => update("coutMainOeuvre", e.target.value)}
              placeholder="0"
              required
              className="h-9 rounded-xl border-[#F2E6E1] bg-white text-xs text-stone-900 focus:border-[#8B3A1C]"
            />
          </div>
        </div>
      </div>

      {/* Marge & Prix de vente */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#F2E6E1] bg-white p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <Label htmlFor={`${idPrefix}-marge`} className="text-xs font-semibold">
              Marge souhaitée (%)
            </Label>
          </div>
          <Input
            id={`${idPrefix}-marge`}
            type="number"
            min="0"
            step="1"
            value={values.pourcentageMarge}
            onChange={(e) => update("pourcentageMarge", e.target.value)}
            placeholder="ex: 50"
            className="h-9 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs focus:border-[#8B3A1C]"
          />
          {prixVenteSuggere !== null && (
            <p className="text-[11px] font-medium text-[#8B3A1C]">
              Prix suggéré : <span className="font-bold">{formatCurrency(prixVenteSuggere)}</span>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[#F2E6E1] bg-white p-3.5 space-y-2">
          <Label htmlFor={`${idPrefix}-prixVente`} className="text-xs font-semibold text-stone-800">
            Prix de vente final (MGA) <span className="text-[#8B3A1C]">*</span>
          </Label>
          <Input
            id={`${idPrefix}-prixVente`}
            type="number"
            min="0"
            step="0.01"
            value={values.prixVente}
            onChange={(e) => update("prixVente", e.target.value)}
            placeholder="0.00"
            required
            className="h-9 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs font-bold text-stone-900 focus:border-[#8B3A1C]"
          />
        </div>
      </div>

      {/* Gestion des Stocks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-stock`} className="text-xs font-semibold text-stone-700">
            Quantité en stock <span className="text-[#8B3A1C]">*</span>
          </Label>
          <Input
            id={`${idPrefix}-stock`}
            type="number"
            min="0"
            value={values.quantiteStock}
            onChange={(e) => update("quantiteStock", e.target.value)}
            placeholder="0"
            required
            className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs focus:border-[#8B3A1C]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-seuil`} className="text-xs font-semibold text-stone-700">
            Seuil d'alerte stock
          </Label>
          <Input
            id={`${idPrefix}-seuil`}
            type="number"
            min="0"
            value={values.seuilAlerte}
            onChange={(e) => update("seuilAlerte", e.target.value)}
            placeholder="3 par défaut"
            className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs focus:border-[#8B3A1C]"
          />
        </div>
      </div>

      {/* Visibilité et Statut */}
      <div className="space-y-2 border-t border-[#F2E6E1] pt-4">
        <div className="flex items-center justify-between rounded-2xl border border-[#F2E6E1] bg-[#FAF6F4]/40 px-3.5 py-2.5 transition-colors hover:bg-[#FAF6F4]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#8B3A1C] shadow-sm ring-1 ring-[#8B3A1C]/10">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <Label htmlFor={`${idPrefix}-vitrine`} className="cursor-pointer text-xs font-bold text-stone-800">
                Publier sur la vitrine
              </Label>
              <p className="text-[11px] text-stone-500">Rendre cet article visible par vos clients en ligne.</p>
            </div>
          </div>
          <Switch
            id={`${idPrefix}-vitrine`}
            checked={values.publieVitrine}
            onCheckedChange={(checked) => update("publieVitrine", checked)}
          />
        </div>

        {showActifToggle && (
          <div className="flex items-center justify-between rounded-2xl border border-[#F2E6E1] bg-[#FAF6F4]/40 px-3.5 py-2.5 transition-colors hover:bg-[#FAF6F4]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-600/10">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <Label htmlFor={`${idPrefix}-actif`} className="cursor-pointer text-xs font-bold text-stone-800">
                  Article actif
                </Label>
                <p className="text-[11px] text-stone-500">Activer l'article pour la gestion interne des stocks.</p>
              </div>
            </div>
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