import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { authService } from "@/api/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email });
    } finally {
      // Le backend renvoie toujours 200, même si l'email n'existe pas
      // (anti-énumération de comptes) - on affiche donc systématiquement
      // le même message de succès, sans jamais révéler si l'email existe.
      setIsLoading(false);
      setSent(true);
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
            Mot de passe oublié
          </p>
        </div>

        {/* Card Form / Confirmation */}
        <div className="overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white p-7 shadow-xl shadow-[#8B3A1C]/5 backdrop-blur-sm">
          {sent ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-3.5 text-xs font-medium leading-relaxed text-emerald-900">
                Si un compte existe avec cet e-mail, un code de réinitialisation
                vient d'être envoyé.
              </div>
              <Button
                onClick={() =>
                  navigate(`/reset-password?email=${encodeURIComponent(email)}`)
                }
                className="h-10 w-full gap-2 rounded-xl bg-[#8B3A1C] text-xs font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F16] active:scale-[0.98]"
              >
                <span>J'ai reçu le code</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-10 w-full gap-2 rounded-xl bg-[#8B3A1C] text-xs font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F16] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Envoyer le code</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Link back to Login */}
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