import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";
import { clientAuthService } from "@/api/clientAuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

export function ClientProfilePage() {
    const { client, isLoading, refreshClient } = useClientAuth();
    const navigate = useNavigate();

    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const [nom, setNom] = useState(client?.nom ?? "");
    const [prenom, setPrenom] = useState(client?.prenom ?? "");
    const [email, setEmail] = useState(client?.email ?? "");
    const [telephone, setTelephone] = useState(client?.telephone ?? "");
    const [adresse, setAdresse] = useState(client?.adresse ?? "");

    if (isLoading) {
        return (
            <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
                <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
                    <div className="mb-4 h-6 w-40 animate-pulse rounded-md bg-[var(--muted)]" />
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="h-11 animate-pulse rounded-xl bg-[var(--muted)]" />
                            <div className="h-11 animate-pulse rounded-xl bg-[var(--muted)]" />
                        </div>
                        <div className="h-11 animate-pulse rounded-xl bg-[var(--muted)]" />
                        <div className="h-11 animate-pulse rounded-xl bg-[var(--muted)]" />
                        <div className="h-11 animate-pulse rounded-xl bg-[var(--muted)]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-[var(--border)] bg-[var(--muted)] p-8 text-center shadow-sm">
                <p className="text-lg font-semibold text-[var(--foreground)]">Profil indisponible pour le moment.</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">Veuillez réessayer dans quelques instants.</p>
            </div>
        );
    }

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleProfileSubmit(e: FormEvent) {
        e.preventDefault();
        setProfileError(null);
        setProfileSuccess(false);
        setIsLoadingProfile(true);

        try {
            const auth = await clientAuthService.updateProfile({
                nom,
                prenom,
                email,
                telephone,
                adresse,
            });

            if (auth.accessToken) {
                localStorage.setItem("felana_client_token", auth.accessToken);
                await refreshClient();
            }

            setProfileSuccess(true);
            setProfileError(null);
        } catch (err) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            if (axiosError.response?.status === 401) {
                localStorage.removeItem("felana_client_token");
                localStorage.removeItem("felana_client_user");
                navigate("/shop/connexion", { replace: true });
                return;
            }
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
            const auth = await clientAuthService.changePassword({
                currentPassword,
                newPassword,
            });

            if (auth.accessToken) {
                localStorage.setItem("felana_client_token", auth.accessToken);
                await refreshClient();
            }

            setPasswordSuccess(true);
            setPasswordError(null);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const axiosError = err as AxiosError<ApiErrorResponse>;
            if (axiosError.response?.status === 401) {
                localStorage.removeItem("felana_client_token");
                localStorage.removeItem("felana_client_user");
                navigate("/shop/connexion", { replace: true });
                return;
            }
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
            <h1 className="text-3xl font-bold tracking-tight text-[#222222]">
                Mon profil client
            </h1>

            <div className="rounded-2xl border border-[#EAE2DD] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-4 text-lg font-semibold text-[#222222]">
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
                        <div className="rounded-lg border border-[#F0D2C1] bg-[#FFF5F0] px-3 py-2 text-sm text-[#B95C2C]">
                            {profileError}
                        </div>
                    )}

                    {profileSuccess && (
                        <div className="rounded-lg border border-[#D9E9D5] bg-[#F4FBF3] px-3 py-2 text-sm text-[#28643B]">
                            Modifications enregistrées avec succès !
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoadingProfile}
                        className="w-full rounded-md bg-[#E86F3D] text-white hover:bg-[#D95F2C]"
                    >
                        {isLoadingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                </form>
            </div>

            <div className="rounded-2xl border border-[#EAE2DD] bg-[#F9F9F9] p-6 shadow-sm sm:p-8">
                <h2 className="mb-4 text-lg font-semibold text-[#222222]">
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
                        <div className="rounded-lg border border-[#F0D2C1] bg-[#FFF5F0] px-3 py-2 text-sm text-[#B95C2C]">
                            {passwordError}
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="rounded-lg border border-[#D9E9D5] bg-[#F4FBF3] px-3 py-2 text-sm text-[#28643B]">
                            Mot de passe modifié avec succès.
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoadingPassword}
                        className="w-full rounded-md bg-[#E86F3D] text-white hover:bg-[#D95F2C]"
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