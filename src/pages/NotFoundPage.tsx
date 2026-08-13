import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <span className="text-5xl font-bold text-teal-700">404</span>
      <p className="mt-3 text-lg font-medium text-gray-900">Page introuvable</p>
      <p className="mt-1 text-sm text-gray-500">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Button asChild className="mt-6 bg-teal-700 text-white hover:bg-teal-800">
        <Link to="/dashboard">Retour au tableau de bord</Link>
      </Button>
    </div>
  );
}