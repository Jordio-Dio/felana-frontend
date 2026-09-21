import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search,  UserX, Users } from "lucide-react";
import { userService } from "@/api/userService";
import { authService } from "@/api/authService";
import { useAuth } from "@/context/AuthContext";
import type { UserAccount } from "@/types/user.types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CreateVendeurDialog } from "@/components/vendeurs/CreateVendeurDialog";
import { VerifyEmailDialog } from "@/components/vendeurs/VerifyEmailDialog";
import { formatDate } from "@/lib/formatters";
import { notify } from "@/lib/toast";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

export function VendeursListPage() {
  const { user: currentUser } = useAuth();
  const [vendeurs, setVendeurs] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const filteredVendeurs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vendeurs;
    return vendeurs.filter(
      (vendeur) =>
        vendeur.name.toLowerCase().includes(term) ||
        vendeur.email.toLowerCase().includes(term)
    );
  }, [vendeurs, search]);

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
      notify.error("Erreur lors de l'envoi du code de vérification.");
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#F2E6E1] pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Comptes Vendeurs
          </h2>
          <p className="text-xs text-stone-500">
            Gérez les accès et les permissions de votre équipe commerciale.
          </p>
        </div>
        <CreateVendeurDialog
          onCreated={(email) => {
            loadVendeurs();
            setVerifyEmailTarget(email);
          }}
        />
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B3A1C]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un vendeur par nom, email..."
          className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-10 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
        />
      </div>

      {/* Liste des vendeurs */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 w-full animate-pulse rounded-2xl border border-[#F2E6E1] bg-[#FAF6F4]/50 p-4"
              />
            ))}
          </div>
        ) : filteredVendeurs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#F2E6E1] bg-[#FAF6F4]/30 py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#8B3A1C] shadow-sm ring-1 ring-[#8B3A1C]/10 mb-3">
              {search ? <UserX className="h-6 w-6" /> : <Users className="h-6 w-6" />}
            </div>
            <h3 className="text-sm font-bold text-stone-800">
              {search ? "Aucun vendeur trouvé" : "Aucun vendeur enregistré"}
            </h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm">
              {search
                ? "Aucun membre de l'équipe ne correspond à votre recherche."
                : "Créez votre premier compte vendeur pour autoriser l'accès aux ventes."}
            </p>
          </div>
        ) : (
          filteredVendeurs.map((vendeur) => (
            <ListItemCard
              key={vendeur.id}
              leading={
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF6F4] text-xs font-bold text-[#8B3A1C] border border-[#F2E6E1]">
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
                        className="h-auto p-0 text-xs font-semibold text-[#8B3A1C] hover:text-[#722F17]"
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
              actions={
                <div className="flex items-center gap-3 bg-[#FAF6F4]/60 px-3 py-1.5 rounded-xl border border-[#F2E6E1]">
                  <span className="text-xs font-medium text-stone-600">
                    {vendeur.enabled ? "Actif" : "Inactif"}
                  </span>
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