import type { ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

interface NavItem {
  label: string;
  icon: string;
  path: string;
  roles: ('superadmin' | 'supervisor' | 'testigo')[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', icon: 'dashboard', path: '/dashboard', roles: ['superadmin', 'supervisor', 'testigo'] },
  { label: 'User Management', icon: 'group', path: '/superadmin/users', roles: ['superadmin'] },
  { label: 'Testigos', icon: 'group', path: '/supervisor/testigos', roles: ['supervisor'] },
  { label: 'Votantes', icon: 'how_to_reg', path: '/supervisor/votantes', roles: ['supervisor'] },
  { label: 'Voting Zones', icon: 'map', path: '/superadmin/zones', roles: ['superadmin', 'supervisor'] },
  { label: 'Reports', icon: 'analytics', path: '/superadmin/reports', roles: ['superadmin'] },
  { label: 'Subir E-14', icon: 'upload_file', path: '/testigo/upload', roles: ['testigo'] },
];

export default function DashboardLayout({ children, title }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const allowedNavItems = NAV_ITEMS.filter(item => role && item.roles.includes(role));

  const roleLabels = {
    superadmin: 'Superadmin Profile',
    supervisor: 'Supervisor Profile',
    testigo: 'Testigo Profile',
  };

  const roleDescriptions = {
    superadmin: 'System Administrator',
    supervisor: 'Coordinador de Zona',
    testigo: 'Testigo Electoral',
  };

  const initials = role === 'superadmin' ? 'SA' : role === 'supervisor' ? 'SU' : 'TE';

  return (
    <div className="bg-background text-on-background h-full flex overflow-hidden">
      {/* NavigationDrawer */}
      <aside className="hidden lg:flex flex-col py-lg space-y-base h-full w-72 fixed left-0 top-0 border-r border-outline-variant bg-surface-container-low z-40">
        <div className="px-lg pb-6">
          <h1 className="font-headline-md text-headline-md text-primary pt-4">Civic Guard</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {allowedNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === `/${role}`);
            
            if (isActive) {
              return (
                <button key={item.path} onClick={() => navigate(item.path)} className="w-full bg-primary-container text-on-primary-container rounded-full mx-2 px-4 py-3 flex items-center gap-4 transition-colors hover:bg-surface-container-highest scale-95 transition-transform text-left">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  <span className="font-label-bold text-label-bold">{item.label}</span>
                </button>
              );
            }
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className="w-full text-on-surface-variant mx-2 px-4 py-3 flex items-center gap-4 hover:bg-surface-container-highest transition-colors rounded-full text-left">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-bold text-label-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4">
          <button onClick={handleLogout} className="w-full text-secondary mx-2 px-4 py-3 flex items-center gap-4 hover:bg-error-container transition-colors rounded-full text-left">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-bold text-label-bold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-72 h-full overflow-hidden">
        {/* TopAppBar */}
        <header className="flex justify-between items-center w-full px-gutter h-16 docked full-width top-0 border-b border-outline-variant bg-surface z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-on-surface-variant p-2 -ml-2 rounded-full hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
              <h2 className="font-display text-display text-primary uppercase tracking-tight hidden sm:block">{title}</h2>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase tracking-tight sm:hidden">{title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="font-label-bold text-label-bold text-on-surface">{role ? roleLabels[role] : 'User Profile'}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{role ? roleDescriptions[role] : 'User'}</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-outline-variant bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-gutter lg:p-lg pb-24 lg:pb-lg">
          {children}
        </main>
      </div>

      {/* BottomNavBar */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 pb-safe border-t border-outline-variant bg-surface/90 backdrop-blur-md shadow-md z-50">
        {allowedNavItems.slice(0, 3).map((item) => {
           const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === `/${role}`);
           if (isActive) {
             return (
               <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl p-2 w-16 hover:bg-surface-container-high scale-90 transition-all duration-100">
                  <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  <span className="font-label-sm text-label-sm-mobile font-label-bold text-label-bold text-primary truncate max-w-full">{item.label}</span>
                </button>
             );
           }
           return (
              <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-16 hover:bg-surface-container-high transition-colors rounded-xl">
                <span className="material-symbols-outlined mb-1">{item.icon}</span>
                <span className="font-label-sm text-label-sm-mobile truncate max-w-full">{item.label}</span>
              </button>
           );
        })}
        
        <button onClick={handleLogout} className="flex flex-col items-center justify-center text-secondary p-2 w-16 hover:bg-error-container transition-colors rounded-xl">
          <span className="material-symbols-outlined mb-1">logout</span>
          <span className="font-label-sm text-label-sm-mobile truncate max-w-full">Salir</span>
        </button>
      </nav>
    </div>
  );
}
