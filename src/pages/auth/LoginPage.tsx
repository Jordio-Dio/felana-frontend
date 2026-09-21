import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.error ??
        "Impossible de se connecter. Vérifiez vos identifiants.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        
        {/* Branding Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B3A1C] text-white shadow-lg shadow-[#8B3A1C]/25 ring-4 ring-[#8B3A1C]/10">
            <span className="font-serif text-2xl font-black tracking-widest">H</span>
          </div>
          <h1 className="text-2xl font-black tracking-widest uppercase text-stone-900">
            Hiba création Toamasina
          </h1>
          <p className="mt-1 text-xs font-medium text-stone-500">
            Espace d'administration
          </p>
        </div>

        {/* Card Form */}
        <div className="overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white p-7 shadow-xl shadow-[#8B3A1C]/5 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Field: Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-stone-700">
                Adresse e-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-10 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus-visible:border-[#8B3A1C] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#8B3A1C]"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-stone-700">
                  Mot de passe
                </Label>
                <Link
                  to="/mot-de-passe-oublie"
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-10 pr-10 text-xs text-stone-900 placeholder:text-stone-400 focus-visible:border-[#8B3A1C] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#8B3A1C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Feedback */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-10 w-full gap-2 rounded-xl bg-[#8B3A1C] text-xs font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F16] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connexion en cours...</span>
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

      </div>
    </div>
  );
}