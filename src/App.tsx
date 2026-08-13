import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHome } from "@/pages/dashboard/DashboardHome";
import { VendeursListPage } from "@/pages/vendeurs/VendeursListPage";
import { ClientsListPage } from "@/pages/clients/ClientsListPage";
import { ArticlesListPage } from "@/pages/catalog/ArticlesListPage";
import { CategoriesPage } from "@/pages/catalog/CategoriesPage";
import { CommandesListPage } from "@/pages/orders/CommandesListPage";
import { NewSalePage } from "@/pages/orders/NewSalePage";
import { CommandeDetailPage } from "@/pages/orders/CommandeDetailPage";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/clients" element={<ClientsListPage />} />
              <Route path="/articles" element={<ArticlesListPage />} />
              <Route path="/commandes" element={<CommandesListPage />} />
              <Route path="/commandes/nouvelle" element={<NewSalePage />} />
              <Route path="/commandes/:id" element={<CommandeDetailPage />} />

              <Route element={<ProtectedRoute allowedRoles={["GERANT"]} />}>
                <Route path="/vendeurs" element={<VendeursListPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;