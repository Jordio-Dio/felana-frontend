import { LogOut, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  GERANT: "Gérant",
  VENDEUR: "Vendeur",
};

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none ring-[#8B3A1C] transition-shadow focus-visible:ring-2">
              <Avatar className="h-9 w-9 ring-2 ring-[#F2E6E1]">
                <AvatarFallback className="bg-[#8B3A1C]/10 text-xs font-bold text-[#8B3A1C]">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="bg-stone-900 text-xs font-medium text-white">
          Mon compte
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl border-[#F2E6E1] bg-white p-1.5 shadow-xl shadow-[#8B3A1C]/5">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-stone-900">{user.name}</span>
            <span className="text-xs font-medium text-[#8B3A1C]">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#F2E6E1]" />
        <DropdownMenuItem disabled className="px-3 py-2 text-xs text-stone-500 opacity-80">
          <UserIcon className="mr-2.5 h-4 w-4 text-stone-400" />
          {user.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#F2E6E1]" />
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition-colors focus:bg-[#FAF6F4] focus:text-[#8B3A1C]">
          <Link to="/profile" className="cursor-pointer">
            <UserIcon className="mr-2.5 h-4 w-4" />
            Mon profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={logout}
          className="rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="mr-2.5 h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}