import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { commandeService } from "@/api/commandeService";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const POLL_INTERVAL_MS = 60_000; // rafraîchit toutes les 60 secondes

export function NotificationBell() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  const loadCount = useCallback(async () => {
    try {
      const value = await commandeService.getNotificationCount();
      setCount(value);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications :", error);
    }
  }, []);

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadCount]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate("/commandes?statut=EN_ATTENTE_VALIDATION")}
          aria-label="Commandes en attente de validation"
        >
          <Bell className="h-5 w-5 text-gray-500" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Commandes en attente de validation</TooltipContent>
    </Tooltip>
  );
}