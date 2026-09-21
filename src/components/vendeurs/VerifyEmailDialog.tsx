import { useState, type FormEvent } from "react";
import { Loader2, MailCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authService } from "@/api/authService";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";
import { notify } from "@/lib/toast";

interface VerifyEmailDialogProps {
  email: string | null;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

export function VerifyEmailDialog({ email, onOpenChange, onVerified }: VerifyEmailDialogProps) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetLocalState() {
    setCode("");
    setError(null);
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setIsVerifying(true);

    try {
      await authService.verifyEmail({ email, code });
      resetLocalState();
      onVerified();
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.error ??
        "Code invalide ou expiré. Vérifiez le code reçu par e-mail.";
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (!email) return;

    setError(null);
    setIsResending(true);

    try {
      await authService.resendVerification(email);
      notify.success("Un nouveau code a été envoyé.");
    } catch {
      setError("Impossible d'envoyer un nouveau code pour le moment.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Dialog
      open={email !== null}
      onOpenChange={(next) => {
        if (!next) resetLocalState();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-sm rounded-2xl border-[#F2E6E1] bg-white p-6 shadow-xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF6F4] text-[#8B3A1C] border border-[#F2E6E1] shadow-xs">
            <MailCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-base font-bold text-stone-900">
            Vérifier l'adresse e-mail
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500 max-w-[#260px]">
            Un code à 6 chiffres a été envoyé à{" "}
            <strong className="text-stone-800 font-semibold">{email}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="verify-code" className="text-xs font-semibold text-stone-700 block text-center">
              Code de vérification
            </Label>
            <Input
              id="verify-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="h-11 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/40 text-center text-lg font-mono tracking-[0.5em] text-stone-900 placeholder:text-stone-300 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              disabled={isVerifying || code.length !== 6}
              className="h-10 w-full rounded-xl bg-[#8B3A1C] text-xs font-semibold text-white transition-colors hover:bg-[#722F17] disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier le code"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={isResending}
              onClick={handleResend}
              className="h-9 w-full rounded-xl text-xs font-medium text-stone-600 hover:bg-[#FAF6F4] hover:text-stone-900"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Renvoyer un nouveau code"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}