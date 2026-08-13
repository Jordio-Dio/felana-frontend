import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la fiche client</DialogTitle>
        </DialogHeader>

        {values && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <ClientFormFields values={values} onChange={setValues} idPrefix="edit" />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-700 text-white hover:bg-teal-800 sm:w-auto"
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
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}