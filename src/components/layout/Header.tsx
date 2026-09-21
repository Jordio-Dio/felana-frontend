import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Tableau de bord" }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#F2E6E1] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <h1 className="text-base font-bold tracking-tight text-stone-900 sm:text-lg">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="h-5 w-px bg-[#F2E6E1]" aria-hidden="true" />
        <UserMenu />
      </div>
    </header>
  );
}