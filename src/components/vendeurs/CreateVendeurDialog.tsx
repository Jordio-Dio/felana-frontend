import { useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { userService } from "@/api/userService";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

interface CreateVendeurDialogProps {
  onCreated: (email: string) => void;
}

export function CreateVendeurDialog({ onCreated }: CreateVendeurDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setname("");
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
        <Button className="bg-teal-700 text-white hover:bg-teal-800">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau vendeur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un compte vendeur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vendeur-name">name complet</Label>
            <Input
              id="vendeur-name"
              value={name}
              onChange={(e) => setname(e.target.value)}
              placeholder="Rakoto Jean"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendeur-email">Adresse e-mail</Label>
            <Input
              id="vendeur-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendeur@felana.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendeur-password">Mot de passe</Label>
            <Input
              id="vendeur-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Au moins 8 caractères"
              minLength={8}
              required
            />
          </div>

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
                  Création...
                </>
              ) : (
                "Créer le compte"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}