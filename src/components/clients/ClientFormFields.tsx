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
 * EditClientDialog, pour éviter de dupliquer le JSX à deux endroits.
 */
export function ClientFormFields({ values, onChange, idPrefix }: ClientFormFieldsProps) {
  function update<K extends keyof ClientRequest>(key: K, value: ClientRequest[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-nom`}>Nom</Label>
          <Input
            id={`${idPrefix}-nom`}
            value={values.nom}
            onChange={(e) => update("nom", e.target.value)}
            placeholder="Rakoto"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-prenom`}>Prénom</Label>
          <Input
            id={`${idPrefix}-prenom`}
            value={values.prenom ?? ""}
            onChange={(e) => update("prenom", e.target.value || null)}
            placeholder="Jean"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-email`}>Adresse e-mail</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={values.email ?? ""}
          onChange={(e) => update("email", e.target.value || null)}
          placeholder="client@exemple.com (optionnel)"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-telephone`}>Téléphone</Label>
        <Input
          id={`${idPrefix}-telephone`}
          value={values.telephone ?? ""}
          onChange={(e) => update("telephone", e.target.value || null)}
          placeholder="034 XX XXX XX"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-adresse`}>Adresse</Label>
        <Input
          id={`${idPrefix}-adresse`}
          value={values.adresse ?? ""}
          onChange={(e) => update("adresse", e.target.value || null)}
          placeholder="Antananarivo, Madagascar"
        />
      </div>
    </div>
  );
}