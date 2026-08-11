import { useCallback, useEffect, useState } from "react";
import { userService } from "@/api/userService";
import { useAuth } from "@/context/AuthContext";
import type { UserAccount } from "@/types/user.types";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateVendeurDialog } from "@/components/vendeurs/CreateVendeurDialog";
import { VerifyEmailDialog } from "@/components/vendeurs/VerifyEmailDialog";
import { formatDate } from "@/lib/formatters";
import { authService } from "@/api/authService";

export function VendeursListPage() {
  const { user: currentUser } = useAuth();
  const [vendeurs, setVendeurs] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [verifyEmailTarget, setVerifyEmailTarget] = useState<string | null>(null);
  const [sendingCodeFor, setSendingCodeFor] = useState<number | null>(null);

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
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
    } finally {
      setTogglingId(null);
    }
  }

   /**
   * Pour un compte existant, aucun code n'est déjà en attente (le seul
   * envoi automatique a lieu à la création). On déclenche donc un envoi
   * explicite AVANT d'ouvrir le dialog de saisie.
   */
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
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Comptes vendeurs</h2>
          <p className="text-sm text-gray-500">
            Gérez les accès de votre équipe de vente.
          </p>
        </div>
        <CreateVendeurDialog
          onCreated={(email) => {
            loadVendeurs();
            setVerifyEmailTarget(email);
          }}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Email vérifié</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-400">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : vendeurs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-400">
                    Aucun vendeur pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                vendeurs.map((vendeur) => (
                  <TableRow key={vendeur.id}>
                    <TableCell className="font-medium">{vendeur.name}</TableCell>
                    <TableCell className="text-gray-600">{vendeur.email}</TableCell>
                    <TableCell>
                      {vendeur.emailVerified ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          Vérifié
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                            Non vérifié
                          </Badge>
                          <Button
                            variant="link"
                            size="sm"
                            disabled={sendingCodeFor === vendeur.id}
                            className="h-auto p-0 text-xs text-teal-700"
                            onClick={() => handleStartVerification(vendeur)}
                          >
                            {sendingCodeFor === vendeur.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />)
                              : (
                                "Vérifier"
                              )
                            }
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">{formatDate(vendeur.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-500">
                          {vendeur.enabled ? "Actif" : "Inactif"}
                        </span>
                        <Switch
                          checked={vendeur.enabled}
                          disabled={togglingId === vendeur.id || vendeur.id === currentUser?.id}
                          onCheckedChange={() => handleToggle(vendeur)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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