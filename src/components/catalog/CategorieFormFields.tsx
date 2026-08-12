import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategorieRequest } from "@/types/catalog.types";

interface CategorieFormFieldsProps {
  values: CategorieRequest;
  onChange: (values: CategorieRequest) => void;
  idPrefix: string;
}

export function CategorieFormFields({ values, onChange, idPrefix }: CategorieFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-nom`}>Nom de la catégorie</Label>
        <Input
          id={`${idPrefix}-nom`}
          value={values.nom}
          onChange={(e) => onChange({ ...values, nom: e.target.value })}
          placeholder="Vêtements"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Input
          id={`${idPrefix}-description`}
          value={values.description ?? ""}
          onChange={(e) => onChange({ ...values, description: e.target.value || null })}
          placeholder="Description optionnelle"
        />
      </div>
    </div>
  );
}