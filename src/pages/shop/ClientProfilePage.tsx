import { useState, type FormEvent } from "react";
import { useClientAuth } from "@/context/ClientAuthContext";
import { clientAuthService } from "@/api/clientAuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

export function ClientProfilePage() {
    const { client, refreshClient } = useClientAuth();

    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const [nom, setNom] = useState(client?.nom ?? "");
    const [prenom, setPrenom] = useState(client?.prenom ?? "");
    const [email, setEmail] = useState((client as any)?.email ?? "");
    const [telephone, setTelephone] = useState(client?.telephone ?? "");
    const [adresse, setAdresse] = useState(client?.adresse ?? "");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleProfileSubmit(e: FormEvent) {
        e.preventDefault();
        setProfileError(null);
        setProfileSuccess(false);
        setIsLoadingProfile(true);

        try {
            await clientAuthService.updateProfile({
                nom,
                prenom,
                email,
                telephone,
                adresse,
            });
            await refreshClient();
            setProfileSuccess(true);
        } catch (err) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            setProfileError(
                axiosError.response?.data?.error ??
                "Erreur lors de la mise à jour du profil."
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
            await clientAuthService.changePassword({
                currentPassword,
                newPassword,
            });
            setPasswordSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            setPasswordError(
                axiosError.response?.data?.error ??
                "Erreur lors du changement de mot de passe."
            );
        } finally {
            setIsLoadingPassword(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Mon profil client
            </h1>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Informations personnelles
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="client-nom">Nom</Label>
                            <Input
                                id="client-nom"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="client-prenom">Prénom</Label>
                            <Input
                                id="client-prenom"
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="client-email">E-mail</Label>
                        <Input
                            id="client-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="client-telephone">Téléphone</Label>
                        <Input
                            id="client-telephone"
                            type="tel"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="client-adresse">Adresse</Label>
                        <Input
                            id="client-adresse"
                            value={adresse}
                            onChange={(e) => setAdresse(e.target.value)}
                        />
                    </div>

                    {profileError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {profileError}
                        </div>
                    )}

                    {profileSuccess && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            Profil mis à jour avec succès.
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoadingProfile}
                        className="w-full bg-teal-700 text-white hover:bg-teal-800"
                    >
                        {isLoadingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                </form>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Changer le mot de passe
                </h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="current-password">Mot de passe actuel</Label>
                        <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
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
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="confirm-password">
                            Confirmer le nouveau mot de passe
                        </Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    {passwordError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {passwordError}
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            Mot de passe modifié avec succès.
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoadingPassword}
                        className="w-full bg-teal-700 text-white hover:bg-teal-800"
                    >
                        {isLoadingPassword
                            ? "Modification..."
                            : "Changer le mot de passe"}
                    </Button>
                </form>
            </div>
        </div>
    );
}