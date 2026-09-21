import { useEffect, useState, type FormEvent } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientFormFields } from "@/components/clients/ClientFormFields";
import { clientService } from "@/api/clientService";
import { notify } from "@/lib/toast";
import type { Client, ClientRequest } from "@/types/client.types";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

interface EditClientDialogProps {
  client: Client | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

function toRequest(client: Client): ClientRequest {
  return {
    nom: client.nom,
    prenom: client.prenom,
    email: client.email,
    telephone: client.telephone,
    adresse: client.adresse,
  };
}

export function EditClientDialog({ client, onOpenChange, onUpdated }: EditClientDialogProps) {
  const [values, setValues] = useState<ClientRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setValues(toRequest(client));
      setError(null);
    }
  }, [client]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!client || !values) return;

    setError(null);
    setIsLoading(true);

    try {
      await clientService.update(client.id, values);
      onOpenChange(false);
      onUpdated();
      notify.success("Client modifié avec succès.");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error ?? "Impossible de modifier ce client.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={client !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-[#F2E6E1] bg-white p-6 shadow-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base font-bold text-stone-900">
            Modifier la fiche client
          </DialogTitle>
        </DialogHeader>

        {values && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <ClientFormFields values={values} onChange={setValues} idPrefix="edit" />

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2.5 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 rounded-xl border-[#F2E6E1] text-xs text-stone-600 hover:bg-[#FAF6F4]"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-9 rounded-xl bg-[#8B3A1C] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#722F17]"
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
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}