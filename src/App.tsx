import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import DashboardRouter from './pages/dashboards/DashboardRouter';
import SuperadminDashboard from './pages/dashboards/SuperadminDashboard';
import SupervisorDashboard from './pages/dashboards/SupervisorDashboard';
import TestigoDashboard from './pages/dashboards/TestigoDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Rutas Privadas / Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/superadmin" element={<SuperadminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['supervisor']} />}>
            <Route path="/supervisor" element={<SupervisorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['testigo']} />}>
            <Route path="/testigo" element={<TestigoDashboard />} />
          </Route>

          {/* Ruta 404 (opcional) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
