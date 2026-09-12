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

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<AuthenticatedClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = clientAuthService.getStoredClient();
    const token = clientAuthService.getToken();
    if (stored && token) {
      setClient(stored);
    }
    setIsLoading(false);
  }, []);

  async function register(payload: ClientRegisterRequest) {
    const auth = await clientAuthService.register(payload);
    const saved = clientAuthService.saveSession(auth);
    // Après l'inscription, récupérer le profil complet
    const profile = await clientAuthService.getProfile();
    setClient(profile);
  }

  async function login(payload: ClientLoginRequest) {
    const auth = await clientAuthService.login(payload);
    const saved = clientAuthService.saveSession(auth);
    // Après le login, récupérer le profil complet
    const profile = await clientAuthService.getProfile();
    setClient(profile);
  }

  function logout() {
    clientAuthService.logout();
    setClient(null);
  }

  async function refreshClient() {
    const profile = await clientAuthService.getProfile();
    setClient(profile);
  }

  return (
    <ClientAuthContext.Provider
      value={{ client, isAuthenticated: client !== null, isLoading, register, login, logout, refreshClient }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth(): ClientAuthContextValue {
  const context = useContext(ClientAuthContext);
  if (!context) throw new Error("useClientAuth doit être utilisé à l'intérieur d'un <ClientAuthProvider>.");
  return context;
}