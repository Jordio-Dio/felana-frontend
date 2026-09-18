import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/api/authService";
import { axiosInstance, STORAGE_KEYS } from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";
import type { AuthResponse } from "@/types/auth.types";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();

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
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
      id: auth.id,
      name: auth.name,
      email: auth.email,
      role: auth.role,
    }));

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
      setProfileError(axiosError.response?.data?.error ?? "Erreur lors de la mise à jour du profil.");
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
      setPasswordError(axiosError.response?.data?.error ?? "Erreur lors du changement de mot de passe.");
    } finally {
      setIsLoadingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Mon profil</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Informations personnelles</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-nom">Nom</Label>
            <Input
              id="profile-nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="rounded-md border-gray-300 bg-white text-gray-900 shadow-sm transition-colors focus-visible:border-[#E86F3D] focus-visible:ring-2 focus-visible:ring-[#E86F3D]/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">E-mail</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border-gray-300 bg-white text-gray-900 shadow-sm transition-colors focus-visible:border-[#E86F3D] focus-visible:ring-2 focus-visible:ring-[#E86F3D]/20"
            />
          </div>

          {profileError && (
            <div className="rounded-md border border-[#FECACA] bg-[#FDF2F2] px-3 py-2 text-sm text-[#991B1B]">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="rounded-md border border-[#D9F2E6] bg-[#F2F9F4] px-3 py-2 text-sm text-[#14532D]">
              Profil mis à jour avec succès.
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoadingProfile}
            className="w-full rounded-md bg-[#E86F3D] text-white hover:bg-[#D95F2C] focus-visible:ring-[#E86F3D]/30"
          >
            {isLoadingProfile ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Changer le mot de passe</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Mot de passe actuel</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="rounded-md border-gray-300 bg-white text-gray-900 shadow-sm transition-colors focus-visible:border-[#E86F3D] focus-visible:ring-2 focus-visible:ring-[#E86F3D]/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
              className="rounded-md border-gray-300 bg-white text-gray-900 shadow-sm transition-colors focus-visible:border-[#E86F3D] focus-visible:ring-2 focus-visible:ring-[#E86F3D]/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              className="rounded-md border-gray-300 bg-white text-gray-900 shadow-sm transition-colors focus-visible:border-[#E86F3D] focus-visible:ring-2 focus-visible:ring-[#E86F3D]/20"
            />
          </div>

          {passwordError && (
            <div className="rounded-md border border-[#FECACA] bg-[#FDF2F2] px-3 py-2 text-sm text-[#991B1B]">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="rounded-md border border-[#D9F2E6] bg-[#F2F9F4] px-3 py-2 text-sm text-[#14532D]">
              Mot de passe modifié avec succès !
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoadingPassword}
            className="w-full rounded-md bg-[#E86F3D] text-white hover:bg-[#D95F2C] focus-visible:ring-[#E86F3D]/30"
          >
            {isLoadingPassword ? "Modification..." : "Changer le mot de passe"}
          </Button>
        </form>
      </div>
    </div>
  );
}