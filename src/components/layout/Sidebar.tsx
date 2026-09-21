import { SidebarNav } from "@/components/layout/SidebarNav";
import { Store } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#F2E6E1] bg-white lg:flex">
      {/* En-tête / Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[#F2E6E1] px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8B3A1C]/10 text-[#8B3A1C] ring-1 ring-[#8B3A1C]/15">
          <Store className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-stone-900">
            Shop<span className="text-[#8B3A1C]">.</span>
          </span>
          <span className="text-[10px] font-medium tracking-wider uppercase text-stone-400">
            Espace Artisan
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav />
      </div>
    </aside>
  );
}