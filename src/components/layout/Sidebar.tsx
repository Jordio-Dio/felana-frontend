import { SidebarNav } from "@/components/layout/SidebarNav";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-xl font-bold tracking-tight text-rose-700">Shop</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>
    </aside>
  );
}