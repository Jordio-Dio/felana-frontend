import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHome } from "@/pages/dashboard/DashboardHome";
import { VendeursListPage } from "@/pages/vendeurs/VendeursListPage";


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

              <Route element={<ProtectedRoute allowedRoles={["GERANT"]} />}>
                <Route path="/vendeurs" element={<VendeursListPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;