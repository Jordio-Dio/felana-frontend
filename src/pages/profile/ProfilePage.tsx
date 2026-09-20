import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/api/authService";
import { axiosInstance, STORAGE_KEYS } from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, KeyRound, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";
import type { AuthResponse } from "@/types/auth.types";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [nom, setNom] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function applyNewTokenSession(auth: AuthResponse | null | undefined) {
    if (!auth || !auth.accessToken) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, auth.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, auth.refreshToken);
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({
        id: auth.id,
        name: auth.name,
        email: auth.email,
        role: auth.role,
      })
    );

    axiosInstance.defaults.headers.common.Authorization = `Bearer ${auth.accessToken}`;
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setIsLoadingProfile(true);

    try {
      const updatedProfile = await authService.updateProfile({ nom, email });
      applyNewTokenSession(updatedProfile);

      await refreshUser();
      setProfileSuccess(true);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setProfileError(
        axiosError.response?.data?.error ?? "Erreur lors de la mise à jour du profil."
      );
    } finally {
      setIsLoadingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoadingPassword(true);

    try {
      const response = await authService.changePassword({ currentPassword, newPassword });
      applyNewTokenSession(response);

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await refreshUser();
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 401) {
        window.location.href = "/login";
        return;
      }
      setPasswordError(
        axiosError.response?.data?.error ?? "Erreur lors du changement de mot de passe."
      );
    } finally {
      setIsLoadingPassword(false);
    }
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "A";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white p-6 shadow-xl shadow-[#8B3A1C]/5">
        
        {/* En-tête de profil compact */}
        <div className="flex flex-col items-center border-b border-[#F2E6E1] pb-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDEEE9] text-base font-black text-[#8B3A1C] shadow-inner">
            {initials}
          </div>
          <h1 className="mt-3 text-xl font-extrabold text-stone-900 tracking-tight">
            {user?.name ?? "Mon Compte"}
          </h1>
          <p className="text-xs text-stone-500 font-medium">{user?.email}</p>
          
          {user?.role && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FAF6F4] px-2.5 py-0.5 text-[11px] font-semibold text-[#8B3A1C] border border-[#F2E6E1]">
              <ShieldCheck className="h-3 w-3" />
              {user.role}
            </span>
          )}
        </div>

        {/* Navigation Onglets (Informations / Sécurité) */}
        <div className="mt-5 flex rounded-xl bg-[#FAF6F4] p-1 border border-[#F2E6E1]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setProfileSuccess(false);
              setProfileError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-white text-[#8B3A1C] shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Informations
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setPasswordSuccess(false);
              setPasswordError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === "password"
                ? "bg-white text-[#8B3A1C] shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            Sécurité
          </button>
        </div>

        {/* Onglet : Informations Personnelles */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="mt-5 space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="profile-nom" className="text-xs font-medium text-stone-600">
                Nom complet
              </Label>
              <Input
                id="profile-nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="profile-email" className="text-xs font-medium text-stone-600">
                E-mail
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
              />
            </div>

            {profileError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Profil mis à jour avec succès.</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoadingProfile}
              className="mt-2 h-10 w-full gap-2 rounded-xl bg-[#8B3A1C] text-xs font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F16] active:scale-[0.98]"
            >
              {isLoadingProfile ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </form>
        )}

        {/* Onglet : Changer le mot de passe */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="current-password" className="text-xs font-medium text-stone-600">
                Mot de passe actuel
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="new-password" className="text-xs font-medium text-stone-600">
                Nouveau mot de passe
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirm-password" className="text-xs font-medium text-stone-600">
                Confirmation
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Mot de passe modifié avec succès !</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoadingPassword}
              className="mt-2 h-10 w-full gap-2 rounded-xl bg-[#8B3A1C] text-xs font-bold text-white shadow-md shadow-[#8B3A1C]/20 transition-all hover:bg-[#722F16] active:scale-[0.98]"
            >
              {isLoadingPassword ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Modification...</span>
                </>
              ) : (
                "Changer le mot de passe"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}