import { useState, type FormEvent } from "react";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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

const EMPTY_FORM: ClientRequest = {
  nom: "",
  prenom: null,
  email: null,
  telephone: null,
  adresse: null,
};

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
        <Button className="h-10 rounded-xl bg-[#8B3A1C] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#722F17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B3A1C]">
          <Plus className="mr-1.5 h-4 w-4" />
          Nouveau client
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl border-[#F2E6E1] bg-white p-6 shadow-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base font-bold text-stone-900">
            Créer une fiche client
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientFormFields values={values} onChange={setValues} idPrefix="create" />

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
              onClick={() => setOpen(false)}
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
                  Création...
                </>
              ) : (
                "Créer le client"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}