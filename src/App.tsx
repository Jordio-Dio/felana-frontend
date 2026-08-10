import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";

// import { DashboardHome } from "@/pages/dashboard/DashboardHome";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<LoginPage />} /> 

          <Route element={<ProtectedRoute />}>
            {/* <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
            </Route> */}
          </Route>

          {/* Exemple de route réservée au GERANT uniquement, pour plus tard : */}
          {/* <Route element={<ProtectedRoute allowedRoles={["GERANT"]} />}>
            <Route path="/parametres" element={<SettingsPage />} />
          </Route> */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;