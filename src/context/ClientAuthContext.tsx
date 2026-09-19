import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clientAuthService } from "@/api/clientAuthService";
import type {
  AuthenticatedClient,
  ClientLoginRequest,
  ClientRegisterRequest,
} from "@/types/clientAuth.types";

interface ClientAuthContextValue {
  client: AuthenticatedClient | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (payload: ClientRegisterRequest) => Promise<void>;
  login: (payload: ClientLoginRequest) => Promise<void>;
  logout: () => void;
  refreshClient: () => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextValue | undefined>(undefined);

// Helper pour vérifier si un JWT est expiré
function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;
    const decodedJson = JSON.parse(atob(payloadBase64));
    if (!decodedJson.exp) return false;
    // Date d'expiration en millisecondes
    return Date.now() >= decodedJson.exp * 1000;
  } catch {
    return true;
  }
}

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<AuthenticatedClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = clientAuthService.getStoredClient();
    const token = clientAuthService.getToken();

    if (stored && token) {
      // Si le token a dépassé les 24h ou est invalide, on nettoie tout
      if (isTokenExpired(token)) {
        clientAuthService.logout();
        setClient(null);
      } else {
        setClient(stored);
      }
    } else {
      clientAuthService.logout();
      setClient(null);
    }
    setIsLoading(false);
  }, []);

  async function register(payload: ClientRegisterRequest) {
    const auth = await clientAuthService.register(payload);
    clientAuthService.saveSession(auth);
    
    const profile = await clientAuthService.getProfile();
    setClient({
      clientId: profile.id,
      nom: profile.nom,
      email: profile.email,
      emailVerifie: auth.emailVerifie,
      prenom: profile.prenom,
      telephone: profile.telephone,
      adresse: profile.adresse,
    });
  }

  async function login(payload: ClientLoginRequest) {
    const auth = await clientAuthService.login(payload);
    clientAuthService.saveSession(auth);
    
    const profile = await clientAuthService.getProfile();
    setClient({
      clientId: profile.id,
      nom: profile.nom,
      email: profile.email,
      emailVerifie: auth.emailVerifie,
      prenom: profile.prenom,
      telephone: profile.telephone,
      adresse: profile.adresse,
    });
  }

  function logout() {
    clientAuthService.logout();
    setClient(null);
  }

  async function refreshClient() {
    try {
      const profile = await clientAuthService.getProfile();
      const current = clientAuthService.getStoredClient();
      setClient({
        clientId: profile.id,
        nom: profile.nom,
        email: profile.email,
        emailVerifie: current?.emailVerifie ?? true,
        prenom: profile.prenom,
        telephone: profile.telephone,
        adresse: profile.adresse,
      });
    } catch {
      // Si le rafraîchissement échoue (401), déconnecter proprement
      logout();
    }
  }

  return (
    <ClientAuthContext.Provider
      value={{
        client,
        isAuthenticated: client !== null,
        isLoading,
        register,
        login,
        logout,
        refreshClient,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth(): ClientAuthContextValue {
  const context = useContext(ClientAuthContext);
  if (!context)
    throw new Error("useClientAuth doit être utilisé à l'intérieur d'un <ClientAuthProvider>.");
  return context;
}