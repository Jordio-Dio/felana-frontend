import { useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authService } from "@/api/authService";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

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
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  function resetLocalState() {
    setCode("");
    setError(null);
    setResendMessage(null);
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
    setResendMessage(null);
    setIsResending(true);

    try {
      await authService.resendVerification(email);
      setResendMessage("Un nouveau code a été envoyé.");
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-teal-50">
            <MailCheck className="h-5 w-5 text-teal-600" />
          </div>
          <DialogTitle>Vérifier l'adresse e-mail</DialogTitle>
          <DialogDescription>
            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>. Saisissez-le
            ci-dessous pour confirmer ce compte.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="verify-code">Code de vérification</Label>
            <Input
              id="verify-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="text-center text-lg tracking-[0.5em]"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {resendMessage && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
              {resendMessage}
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="submit"
              disabled={isVerifying || code.length !== 6}
              className="w-full bg-teal-700 text-white hover:bg-teal-800"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isResending}
              onClick={handleResend}
              className="w-full text-gray-600"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Renvoyer le code"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}