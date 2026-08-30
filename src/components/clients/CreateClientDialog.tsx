import { useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientFormFields } from "@/components/clients/ClientFormFields";
import { clientService } from "@/api/clientService";
import { notify } from "@/lib/toast";
import type { ClientRequest } from "@/types/client.types";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

const EMPTY_FORM: ClientRequest = { nom: "", prenom: null, email: null, telephone: null, adresse: null };

interface CreateClientDialogProps {
  onCreated: () => void;
}

export function CreateClientDialog({ onCreated }: CreateClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ClientRequest>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await clientService.create(values);
      setOpen(false);
      setValues(EMPTY_FORM);
      onCreated();
      notify.success("Client créé avec succès.");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error ?? "Impossible de créer ce client.");
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
      <DialogTrigger asChild>
        <Button className="bg-rose-400 text-white hover:bg-rose-800">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer une fiche client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientFormFields values={values} onChange={setValues} idPrefix="create" />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-400 text-white hover:bg-rose-500 sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}