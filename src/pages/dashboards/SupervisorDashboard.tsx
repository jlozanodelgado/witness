import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function SupervisorDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-display font-display text-primary mb-4">Supervisor Dashboard</h1>
      <p className="text-body-lg text-on-surface mb-8">Bienvenido al panel de supervisión de tu zona.</p>
      <button 
        onClick={handleLogout}
        className="px-4 py-2 bg-secondary text-on-secondary rounded font-label-bold"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
