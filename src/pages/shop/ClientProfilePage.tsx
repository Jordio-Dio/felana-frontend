import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";
import { clientAuthService } from "@/api/clientAuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

export function ClientProfilePage() {
    const { client, isLoading, refreshClient } = useClientAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

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

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="w-full max-w-md rounded-3xl border border-[#F2E6E1] bg-white p-6 shadow-sm">
                    <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-[#FAF6F4]" />
                    <div className="mt-4 h-6 w-3/4 animate-pulse rounded-md bg-[#FAF6F4] mx-auto" />
                    <div className="mt-6 space-y-3">
                        <div className="h-10 animate-pulse rounded-xl bg-[#FAF6F4]" />
                        <div className="h-10 animate-pulse rounded-xl bg-[#FAF6F4]" />
                        <div className="h-10 animate-pulse rounded-xl bg-[#FAF6F4]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="w-full max-w-sm rounded-3xl border border-dashed border-[#E09F82]/40 bg-[#FAF6F4] p-8 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-[#8B3A1C]" />
                    <p className="mt-3 text-base font-bold text-stone-900">Profil indisponible</p>
                    <p className="mt-1 text-xs text-stone-500">Veuillez réessayer dans quelques instants.</p>
                </div>
            </div>
        );
    }

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

    const initials = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "C";

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#F2E6E1] bg-white p-6 shadow-xl shadow-[#8B3A1C]/5">
                
                {/* En-tête de profil compact */}
                <div className="flex flex-col items-center border-b border-[#F2E6E1] pb-5 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDEEE9] text-base font-black text-[#8B3A1C] shadow-inner">
                        {initials}
                    </div>
                    <h1 className="mt-3 text-xl font-extrabold text-stone-900 tracking-tight">
                        {prenom} {nom}
                    </h1>
                    <p className="text-xs text-stone-500 font-medium">{email}</p>
                </div>

                {/* Sélecteur d'onglets (Profil vs Mot de passe) */}
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

                {/* Formulaire Informations */}
                {activeTab === "profile" && (
                    <form onSubmit={handleProfileSubmit} className="mt-5 space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="client-nom" className="text-xs font-medium text-stone-600">
                                    Nom
                                </Label>
                                <Input
                                    id="client-nom"
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="client-prenom" className="text-xs font-medium text-stone-600">
                                    Prénom
                                </Label>
                                <Input
                                    id="client-prenom"
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="client-email" className="text-xs font-medium text-stone-600">
                                E-mail
                            </Label>
                            <Input
                                id="client-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="client-telephone" className="text-xs font-medium text-stone-600">
                                Téléphone
                            </Label>
                            <Input
                                id="client-telephone"
                                type="tel"
                                value={telephone}
                                onChange={(e) => setTelephone(e.target.value)}
                                className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="client-adresse" className="text-xs font-medium text-stone-600">
                                Adresse
                            </Label>
                            <Input
                                id="client-adresse"
                                value={adresse}
                                onChange={(e) => setAdresse(e.target.value)}
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
                                <span>Modifications enregistrées avec succès !</span>
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

                {/* Formulaire Mot de Passe */}
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
                                className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
                                required
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
                                className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
                                required
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
                                className="h-9 rounded-xl border-[#F2E6E1] text-xs focus-visible:ring-[#8B3A1C]"
                                required
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
                                <span>Mot de passe modifié avec succès.</span>
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