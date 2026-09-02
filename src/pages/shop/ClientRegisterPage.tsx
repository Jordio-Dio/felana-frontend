import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";
import { useClientAuth } from "@/context/ClientAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

export function ClientRegisterPage() {
  const { register } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? "/shop";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() && !telephone.trim()) {
      setError("Renseignez un email ou un numéro de téléphone (au moins l'un des deux).");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        nom,
        prenom: prenom || null,
        email: email || null,
        telephone: telephone || null,
        password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error ?? "Impossible de créer ce compte.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <span className="text-2xl font-bold tracking-tight text-teal-700">FELANA</span>
        <h1 className="mt-2 text-lg font-semibold text-gray-900">Créer mon compte</h1>
        <p className="mt-1 text-xs text-gray-400">
          Un email ou un numéro de téléphone suffit — les deux sont acceptés.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="nom">Nom</Label>
            <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prenom">Prénom</Label>
            <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Optionnel si téléphone renseigné"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Optionnel si email renseigné"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-teal-700 text-white hover:bg-teal-800"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Créer mon compte
            </>
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Déjà un compte ?{" "}
        <Link to="/shop/connexion" state={{ from }} className="font-medium text-teal-700 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}