import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] text-stone-900 antialiased selection:bg-[#8B3A1C]/15 selection:text-[#8B3A1C]">
      {/* Navigation latérale sur Desktop */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}