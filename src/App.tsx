import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShopLayout } from "@/components/layout/ShopLayout";
import { DashboardHome } from "@/pages/dashboard/DashboardHome";
import { VendeursListPage } from "@/pages/vendeurs/VendeursListPage";
import { ClientsListPage } from "@/pages/clients/ClientsListPage";
import { ArticlesListPage } from "@/pages/catalog/ArticlesListPage";
import { CategoriesPage } from "@/pages/catalog/CategoriesPage";
import { CommandesListPage } from "@/pages/orders/CommandesListPage";
import { NewSalePage } from "@/pages/orders/NewSalePage";
import { CommandeDetailPage } from "@/pages/orders/CommandeDetailPage";
import { ShopCatalogPage } from "@/pages/shop/ShopCatalogPage";
import { CheckoutPage } from "@/pages/shop/CheckoutPage";
import { OrderSuccessPage } from "@/pages/shop/OrderSuccessPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Vitrine publique - AUCUNE authentification requise */}
          <Route element={<ShopLayout />}>
            <Route path="/shop" element={<ShopCatalogPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
          </Route>

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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;