import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/auth.types";

interface ProtectedRouteProps {
  /**
   * Si fourni, restreint l'accès à ces rôles précis (ex: ["GERANT"] pour
   * une page réservée au gérant). Si omis, toute personne authentifiée
   * (peu importe le rôle) peut accéder à la route.
   */
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Tant qu'on vérifie la session existante (lecture localStorage au
  // premier rendu), on n'affiche rien plutôt que de rediriger trop tôt.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}