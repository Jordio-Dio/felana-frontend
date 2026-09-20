import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, LogIn, Mail, Phone, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Après connexion, retourne à la page d'où le client venait (ex: checkout)
  const from = (location.state as { from?: string } | null)?.from ?? "/shop";

  useEffect(() => {
    if (isLoading) {
      setError(null);
    }
  }, [isLoading]);

  // Détection du format (téléphone vs email) pour changer l'icône à la volée
  const isPhoneInput = /^[0-9+\s\-]{3,}$/.test(identifiant.trim()) && !identifiant.includes("@");

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
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        
        {/* En-tête de Marque VALISOA */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B3A1C] text-white shadow-lg shadow-[#8B3A1C]/25 ring-4 ring-[#8B3A1C]/10">
            <span className="font-serif text-2xl font-black tracking-widest">H</span>
          </div>
          {/* Titre et sous-titre 
          <h1 className="text-2xl font-black tracking-widest uppercase text-stone-900">
            Hiba création Toamasina
          </h1>*/}
          <p className="mt-1 text-xs font-medium text-stone-500">
            Connexion à mon compte
          </p>
        </div>

        {/* Carte / Formulaire */}
        <div className="overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white p-7 shadow-xl shadow-[#8B3A1C]/5 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Champ Email ou Téléphone */}
            <div className="space-y-1.5">
              <Label htmlFor="identifiant" className="text-xs font-semibold text-stone-700">
                Email ou téléphone
              </Label>
              <div className="relative">
                {isPhoneInput ? (
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B3A1C]" />
                ) : (
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                )}
                <Input
                  id="identifiant"
                  type="text"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="vous@exemple.com ou 034..."
                  required
                  className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-10 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus-visible:border-[#8B3A1C] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#8B3A1C]"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-stone-700">
                  Mot de passe
                </Label>
                <Link
                  to="/shop/mot-de-passe-oublie"
                  className="text-[11px] font-semibold text-[#8B3A1C] transition-colors hover:text-[#722F16]"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-10 pr-10 text-xs text-stone-900 placeholder:text-stone-400 focus-visible:border-[#8B3A1C] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#8B3A1C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Zone d'erreur */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Bouton de soumission */}
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-10 w-full gap-2 rounded-xl bg-[#8B3A1C] text-xs font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F16] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Se connecter</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Lien créer un compte */}
        <p className="mt-6 text-center text-xs text-stone-500">
          Pas encore de compte ?{" "}
          <Link
            to="/shop/inscription"
            state={{ from }}
            className="font-bold text-[#8B3A1C] underline-offset-2 hover:underline"
          >
            Créer un compte
          </Link>
        </p>

      </div>
    </div>
  );
}