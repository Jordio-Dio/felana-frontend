import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategorieRequest } from "@/types/catalog.types";

interface CategorieFormFieldsProps {
  values: CategorieRequest;
  onChange: (values: CategorieRequest) => void;
  idPrefix: string;
}

export function CategorieFormFields({
  values,
  onChange,
  idPrefix,
}: CategorieFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Nom de la catégorie */}
      <div className="space-y-1.5">
        <Label
          htmlFor={`${idPrefix}-nom`}
          className="text-xs font-semibold text-stone-700"
        >
          Nom de la catégorie <span className="text-[#8B3A1C]">*</span>
        </Label>
        <Input
          id={`${idPrefix}-nom`}
          value={values.nom}
          onChange={(e) => onChange({ ...values, nom: e.target.value })}
          placeholder="ex: Robes, Accessoires, Chaussures..."
          required
          className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:bg-white focus:ring-1 focus:ring-[#8B3A1C]"
        />
      </div>

      {/* Description */}
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
          value={values.description ?? ""}
          onChange={(e) =>
            onChange({ ...values, description: e.target.value || null })
          }
          placeholder="Description courte de la catégorie..."
          className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:bg-white focus:ring-1 focus:ring-[#8B3A1C]"
        />
      </div>
    </div>
  );
}