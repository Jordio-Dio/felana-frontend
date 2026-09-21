import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { authService } from "@/api/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.resetPassword({ email, code, newPassword });
      navigate("/login", { replace: true });
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error ?? "Code invalide ou expiré.");
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
            <KeyRound className="h-6 w-6" />
          </div>
        
          <p className="mt-1 text-xs font-medium text-stone-500">
            Réinitialiser le mot de passe
          </p>
        </div>

        {/* Carte / Formulaire */}
        <div className="overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white p-7 shadow-xl shadow-[#8B3A1C]/5 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Champ Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-stone-700"
              >
                Adresse e-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-10 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus-visible:border-[#8B3A1C] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#8B3A1C]"
                />
              </div>
            </div>

            {/* Champ Code OTP */}
            <div className="space-y-1.5">
              <Label
                htmlFor="code"
                className="text-xs font-semibold text-stone-700"
              >
                Code reçu par e-mail
              </Label>
              <Input
                id="code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="h-11 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 font-mono text-center text-lg font-bold tracking-[0.4em] text-[#8B3A1C] placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-400 focus-visible:border-[#8B3A1C] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#8B3A1C]"
                required
              />
            </div>

            {/* Champ Nouveau mot de passe */}
            <div className="space-y-1.5">
              <Label
                htmlFor="newPassword"
                className="text-xs font-semibold text-stone-700"
              >
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  minLength={8}
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

            {/* Message d'erreur */}
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
                  <span>Réinitialisation...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Réinitialiser le mot de passe</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Lien retour connexion */}
        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-500 transition-colors hover:text-stone-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Retour à la connexion</span>
        </Link>

      </div>
    </div>
  );
}