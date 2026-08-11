import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardRouter() {
  const { role, isLoading } = useAuth();

  if (isLoading) return null;

  switch (role) {
    case 'superadmin':
      return <Navigate to="/superadmin" replace />;
    case 'supervisor':
      return <Navigate to="/supervisor" replace />;
    case 'testigo':
      return <Navigate to="/testigo" replace />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
          <h1 className="text-error font-display text-display mb-4">Error de Perfil</h1>
          <p className="text-on-surface font-body-lg">
            No tienes un rol asignado en el sistema. Contacta a un administrador.
          </p>
        </div>
      );
  }
}
