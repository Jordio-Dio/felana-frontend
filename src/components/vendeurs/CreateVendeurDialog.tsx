import { useState, type FormEvent } from "react";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { userService } from "@/api/userService";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";
import { notify } from "@/lib/toast";

interface CreateVendeurDialogProps {
  onCreated: (email: string) => void;
}

export function CreateVendeurDialog({ onCreated }: CreateVendeurDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await userService.createVendeur({ name, email, password });
      setOpen(false);
      onCreated(email);
      resetForm();
      notify.success("Compte vendeur créé. Vérification de l'e-mail en attente.");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.error ??
        "Impossible de créer ce compte vendeur.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-10 rounded-xl bg-[#8B3A1C] px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#722F17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B3A1C]">
          <Plus className="mr-1.5 h-4 w-4" />
          Nouveau vendeur
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl border-[#F2E6E1] bg-white p-6 shadow-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base font-bold text-stone-900">
            Créer un compte vendeur
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vendeur-name" className="text-xs font-semibold text-stone-700">
              Nom complet <span className="text-[#8B3A1C]">*</span>
            </Label>
            <Input
              id="vendeur-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rakoto Jean"
              required
              className="h-9 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/40 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendeur-email" className="text-xs font-semibold text-stone-700">
              Adresse e-mail <span className="text-[#8B3A1C]">*</span>
            </Label>
            <Input
              id="vendeur-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendeur@exemple.com"
              required
              className="h-9 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/40 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendeur-password" className="text-xs font-semibold text-stone-700">
              Mot de passe <span className="text-[#8B3A1C]">*</span>
            </Label>
            <Input
              id="vendeur-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Au moins 8 caractères"
              minLength={8}
              required
              className="h-9 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/40 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
            />
          </div>

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
                "Créer le compte"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}