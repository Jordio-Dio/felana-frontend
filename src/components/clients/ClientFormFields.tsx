import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientRequest } from "@/types/client.types";

interface ClientFormFieldsProps {
  values: ClientRequest;
  onChange: (values: ClientRequest) => void;
  idPrefix: string;
}

/**
 * Champs de formulaire réutilisés à l'identique entre CreateClientDialog et
 * EditClientDialog, mis aux couleurs de la charte VALISOA.
 */
export function ClientFormFields({ values, onChange, idPrefix }: ClientFormFieldsProps) {
  function update<K extends keyof ClientRequest>(key: K, value: ClientRequest[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-3.5 pt-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-nom`} className="text-xs font-semibold text-stone-700">
            Nom <span className="text-[#8B3A1C]">*</span>
          </Label>
          <Input
            id={`${idPrefix}-nom`}
            value={values.nom}
            onChange={(e) => update("nom", e.target.value)}
            placeholder="Rakoto"
            required
            className="h-9 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/40 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-prenom`} className="text-xs font-semibold text-stone-700">
            Prénom
          </Label>
          <Input
            id={`${idPrefix}-prenom`}
            value={values.prenom ?? ""}
            onChange={(e) => update("prenom", e.target.value || null)}
            placeholder="Jean"
            className="h-9 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/40 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-email`} className="text-xs font-semibold text-stone-700">
          Adresse e-mail
        </Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={values.email ?? ""}
          onChange={(e) => update("email", e.target.value || null)}
          placeholder="client@exemple.com"
          className="h-9 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/40 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-telephone`} className="text-xs font-semibold text-stone-700">
          Téléphone
        </Label>
        <Input
          id={`${idPrefix}-telephone`}
          value={values.telephone ?? ""}
          onChange={(e) => update("telephone", e.target.value || null)}
          placeholder="034 XX XXX XX"
          className="h-9 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/40 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-adresse`} className="text-xs font-semibold text-stone-700">
          Adresse
        </Label>
        <Input
          id={`${idPrefix}-adresse`}
          value={values.adresse ?? ""}
          onChange={(e) => update("adresse", e.target.value || null)}
          placeholder="Antananarivo, Madagascar"
          className="h-9 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/40 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
        />
      </div>
    </div>
  );
}