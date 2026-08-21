import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Crochet" }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <h1 className="text-base font-semibold text-gray-900 sm:text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}