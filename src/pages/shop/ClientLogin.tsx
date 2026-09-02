import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { useClientAuth } from "@/context/ClientAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

export function ClientLoginPage() {
  const { login } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Après connexion, retourne à la page d'où le client venait (ex: checkout)
  const from = (location.state as { from?: string } | null)?.from ?? "/shop";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ identifiant, password });
      navigate(from, { replace: true });
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error ?? "Identifiant ou mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <span className="text-2xl font-bold tracking-tight text-teal-700">FELANA</span>
        <h1 className="mt-2 text-lg font-semibold text-gray-900">Connexion à mon compte</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="identifiant">Email ou téléphone</Label>
          <Input
            id="identifiant"
            value={identifiant}
            onChange={(e) => setIdentifiant(e.target.value)}
            placeholder="vous@exemple.com ou 034..."
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              Connexion...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter
            </>
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Pas encore de compte ?{" "}
        <Link to="/shop/inscription" state={{ from }} className="font-medium text-teal-700 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}