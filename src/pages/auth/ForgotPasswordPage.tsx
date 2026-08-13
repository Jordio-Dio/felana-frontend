import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:max-w-md sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <span className="mb-2 text-3xl font-bold tracking-tight text-teal-700 sm:text-4xl">
            FELANA
          </span>
          <h1 className="text-base font-medium text-gray-700 sm:text-lg">
            Mot de passe oublié
          </h1>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-3 text-sm text-teal-700">
              Si un compte existe avec cet e-mail, un code de réinitialisation
              vient d'être envoyé.
            </div>
            <Button
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
              className="w-full bg-teal-700 text-white hover:bg-teal-800"
            >
              J'ai reçu le code
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse e-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@felana.com"
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-700 text-white hover:bg-teal-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Envoyer le code"
              )}
            </Button>
          </form>
        )}

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}