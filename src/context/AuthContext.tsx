import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/api/authService";
import type { AuthenticatedUser, LoginRequest, Role } from "@/types/auth.types";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  // isLoading = true tant qu'on n'a pas fini de vérifier s'il y avait une
  // session existante en localStorage (évite un "flash" de redirection
  // vers /login au rechargement de page alors qu'on est déjà connecté).
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const token = authService.getAccessToken();

    if (storedUser && token) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  async function login(payload: LoginRequest) {
    const authResponse = await authService.login(payload);
    const savedUser = authService.saveSession(authResponse);
    setUser(savedUser);
  }

  function logout() {
    authService.logout();
    setUser(null);
    window.location.href = "/login";
  }

  function hasRole(role: Role): boolean {
    return user?.role === role;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook d'accès au contexte. Lève une erreur explicite si utilisé hors du
 * AuthProvider, plutôt qu'un `undefined` silencieux qui plante plus loin
 * avec un message confus.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>.");
  }
  return context;
}