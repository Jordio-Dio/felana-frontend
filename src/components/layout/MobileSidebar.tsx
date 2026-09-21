import { useState } from "react";
import { Menu, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/SidebarNav";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-stone-700 transition-colors hover:bg-[#FAF6F4] hover:text-[#8B3A1C] lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 border-r border-[#F2E6E1] p-0 bg-white">
        {/* En-tête du menu mobile */}
        <SheetHeader className="flex h-16 flex-row items-center gap-3 border-b border-[#F2E6E1] px-6 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8B3A1C]/10 text-[#8B3A1C] ring-1 ring-[#8B3A1C]/15">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <SheetTitle className="text-base font-extrabold tracking-tight text-stone-900">
              Shop<span className="text-[#8B3A1C]">.</span>
            </SheetTitle>
            <span className="text-[10px] font-medium tracking-wider uppercase text-stone-400">
              Espace Artisan
            </span>
          </div>
        </SheetHeader>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-1 py-4">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}