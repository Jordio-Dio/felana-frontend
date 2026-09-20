import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, UserPlus, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? "/shop";

  useEffect(() => {
    if (isLoading) {
      setError(null);
    }
  }, []);

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
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        
        {/* En-tête de Marque VALISOA */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B3A1C] text-white shadow-lg shadow-[#8B3A1C]/25 ring-4 ring-[#8B3A1C]/10">
            <span className="font-serif text-2xl font-black tracking-widest">V</span>
          </div>
          <h1 className="text-2xl font-black tracking-widest uppercase text-stone-900">
            VALISOA
          </h1>
          <p className="mt-1 text-xs font-medium text-stone-500">
            Créer mon compte
          </p>
          <p className="mt-0.5 text-[11px] text-stone-400">
            Un email ou un téléphone suffit — les deux sont acceptés.
          </p>
        </div>

        {/* Carte / Formulaire */}
        <div className="overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white p-7 shadow-xl shadow-[#8B3A1C]/5 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Grille Nom & Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nom" className="text-xs font-semibold text-stone-700">
                  Nom
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                  <Input
                    id="nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    placeholder="Nom"
                    className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-9 pr-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus-visible:border-[#8B3A1C] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#8B3A1C]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prenom" className="text-xs font-semibold text-stone-700">
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Prénom"
                  className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 px-3 text-xs text-stone-900 placeholder:text-stone-400 focus-visible:border-[#8B3A1C] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#8B3A1C]"
                />
              </div>
            </div>

            {/* Champ Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-stone-700">
                Adresse e-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optionnel si téléphone renseigné"
                  className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-10 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus-visible:border-[#8B3A1C] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#8B3A1C]"
                />
              </div>
            </div>

            {/* Champ Téléphone */}
            <div className="space-y-1.5">
              <Label htmlFor="telephone" className="text-xs font-semibold text-stone-700">
                Téléphone
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="telephone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Optionnel si email renseigné"
                  className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-10 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus-visible:border-[#8B3A1C] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#8B3A1C]"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-stone-700">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  placeholder="••••••••"
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

            {/* Bouton de création */}
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-10 w-full gap-2 rounded-xl bg-[#8B3A1C] text-xs font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F16] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Créer mon compte</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Lien de connexion */}
        <p className="mt-6 text-center text-xs text-stone-500">
          Déjà un compte ?{" "}
          <Link
            to="/shop/connexion"
            state={{ from }}
            className="font-bold text-[#8B3A1C] underline-offset-2 hover:underline"
          >
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
}