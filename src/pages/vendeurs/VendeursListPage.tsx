import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { userService } from "@/api/userService";
import { authService } from "@/api/authService";
import { useAuth } from "@/context/AuthContext";
import type { UserAccount } from "@/types/user.types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CreateVendeurDialog } from "@/components/vendeurs/CreateVendeurDialog";
import { VerifyEmailDialog } from "@/components/vendeurs/VerifyEmailDialog";
import { formatDate } from "@/lib/formatters";
import { notify } from "@/lib/toast";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function VendeursListPage() {
  const { user: currentUser } = useAuth();
  const [vendeurs, setVendeurs] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [sendingCodeFor, setSendingCodeFor] = useState<number | null>(null);
  const [verifyEmailTarget, setVerifyEmailTarget] = useState<string | null>(null);

  const loadVendeurs = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await userService.findVendeurs({ size: 100 });
      setVendeurs(page.content);
    } catch (error) {
      console.error("Erreur lors du chargement des vendeurs :", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendeurs();
  }, [loadVendeurs]);

  async function handleToggle(vendeur: UserAccount) {
    setTogglingId(vendeur.id);
    try {
      const updated = await userService.updateStatut(vendeur.id, !vendeur.enabled);
      setVendeurs((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      notify.success(updated.enabled ? "Compte activé." : "Compte désactivé.");
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
      notify.error("Impossible de modifier le statut de ce compte.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleStartVerification(vendeur: UserAccount) {
    setSendingCodeFor(vendeur.id);
    try {
      await authService.resendVerification(vendeur.email);
      setVerifyEmailTarget(vendeur.email);
    } catch (error) {
      console.error("Erreur lors de l'envoi du code :", error);
    } finally {
      setSendingCodeFor(null);
    }
  }

  function handleVerified() {
    setVerifyEmailTarget(null);
    loadVendeurs();
    notify.success("E-mail vérifié avec succès.");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Comptes vendeurs</h2>
          <p className="text-sm text-gray-500">Gérez les accès de votre équipe de vente.</p>
        </div>
        <CreateVendeurDialog
          onCreated={(email) => {
            loadVendeurs();
            setVerifyEmailTarget(email);
          }}
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-400">Chargement...</p>
        ) : vendeurs.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">Aucun vendeur pour le moment.</p>
        ) : (
          vendeurs.map((vendeur) => (
            <ListItemCard
              key={vendeur.id}
              leading={
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-semibold text-rose-600">
                  {getInitials(vendeur.name)}
                </div>
              }
              title={vendeur.name}
              subtitle={vendeur.email}
              fields={[
                {
                  label: "Email vérifié",
                  value: vendeur.emailVerified ? (
                    <StatusBadge label="Vérifié" tone="rose" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <StatusBadge label="Non vérifié" tone="gray" />
                      <Button
                        variant="link"
                        size="sm"
                        disabled={sendingCodeFor === vendeur.id}
                        className="h-auto p-0 text-xs text-rose-600"
                        onClick={() => handleStartVerification(vendeur)}
                      >
                        {sendingCodeFor === vendeur.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Vérifier"
                        )}
                      </Button>
                    </div>
                  ),
                },
                { label: "Créé le", value: formatDate(vendeur.createdAt) },
              ]}
              trailing={
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{vendeur.enabled ? "Actif" : "Inactif"}</span>
                  <Switch
                    checked={vendeur.enabled}
                    disabled={togglingId === vendeur.id || vendeur.id === currentUser?.id}
                    onCheckedChange={() => handleToggle(vendeur)}
                  />
                </div>
              }
            />
          ))
        )}
      </div>

      <VerifyEmailDialog
        email={verifyEmailTarget}
        onOpenChange={(open) => {
          if (!open) setVerifyEmailTarget(null);
        }}
        onVerified={handleVerified}
      />
    </div>
  );
}