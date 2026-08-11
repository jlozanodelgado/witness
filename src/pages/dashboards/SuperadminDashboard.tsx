import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

interface Perfil {
  id: string;
  nombre_completo: string;
  cedula: string;
  rol: string;
  supervisor_id: string | null;
}

interface Stats {
  testigos: number;
  reportes: number;
  alertas: number;
}

const ROL_LABELS: Record<string, string> = {
  superadmin: 'Superadmin',
  supervisor: 'Supervisor',
  testigo: 'Testigo Electoral',
};

const ROL_COLORS: Record<string, string> = {
  superadmin: 'bg-primary-fixed text-on-primary-fixed',
  supervisor: 'bg-secondary-container text-on-secondary-container',
  testigo: 'bg-tertiary-container text-on-tertiary-container',
};

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase();
}

export default function SuperadminDashboard() {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [filtered, setFiltered] = useState<Perfil[]>([]);
  const [stats, setStats] = useState<Stats>({ testigos: 0, reportes: 0, alertas: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState('');

  // ── Fetch data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          { data: perfilesData, error: perfilesError },
          { count: testigosCount },
          { count: reportesCount },
          { count: alertasCount },
        ] = await Promise.all([
          supabase
            .from('perfiles')
            .select('id, nombre_completo, cedula, rol, supervisor_id')
            .order('nombre_completo'),
          supabase
            .from('perfiles')
            .select('*', { count: 'exact', head: true })
            .eq('rol', 'testigo'),
          supabase
            .from('reportes_mesa')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('reportes_mesa')
            .select('*', { count: 'exact', head: true })
            .not('observaciones', 'is', null),
        ]);

        if (perfilesError) throw perfilesError;

        const data = (perfilesData ?? []) as Perfil[];
        setPerfiles(data);
        setFiltered(data);
        setStats({
          testigos: testigosCount ?? 0,
          reportes: reportesCount ?? 0,
          alertas: alertasCount ?? 0,
        });
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── Local filter ───────────────────────────────────────────────────────────
  useEffect(() => {
    let result = perfiles;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre_completo.toLowerCase().includes(q) ||
          p.cedula.toLowerCase().includes(q),
      );
    }
    if (rolFilter) {
      result = result.filter((p) => p.rol === rolFilter);
    }
    setFiltered(result);
  }, [search, rolFilter, perfiles]);

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="max-w-[1200px] mx-auto space-y-lg">

        {/* ── Stats Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">

          {/* Testigos Activos */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between h-32 group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Testigos Activos</span>
              <div className="p-2 bg-primary-fixed rounded-full text-on-primary-fixed">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
            </div>
            <div>
              {loading
                ? <div className="h-9 w-24 bg-surface-variant rounded animate-pulse" />
                : <span className="font-display text-display text-on-surface">{stats.testigos.toLocaleString()}</span>
              }
            </div>
          </div>

          {/* E-14 Recibidos */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between h-32 group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">E‑14 Recibidos</span>
              <div className="p-2 bg-primary-fixed rounded-full text-on-primary-fixed">
                <span className="material-symbols-outlined">description</span>
              </div>
            </div>
            <div>
              {loading
                ? <div className="h-9 w-24 bg-surface-variant rounded animate-pulse" />
                : <span className="font-display text-display text-on-surface">{stats.reportes.toLocaleString()}</span>
              }
            </div>
          </div>

          {/* Con Observaciones */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between h-32 group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Con Observaciones</span>
              <div className="p-2 bg-error-container rounded-full text-on-error-container">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
            <div>
              {loading
                ? <div className="h-9 w-24 bg-surface-variant rounded animate-pulse" />
                : <span className="font-display text-display text-error">{stats.alertas.toLocaleString()}</span>
              }
            </div>
          </div>
        </div>

        {/* ── Perfiles Table ─────────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col">

          {/* Header */}
          <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Perfiles {!loading && `(${filtered.length})`}
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  id="search-perfiles"
                  className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                  placeholder="Buscar por nombre o cédula..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* Rol filter */}
              <select
                id="filter-rol"
                className="w-full sm:w-auto px-4 py-2 border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none"
                value={rolFilter}
                onChange={(e) => setRolFilter(e.target.value)}
              >
                <option value="">Todos los Roles</option>
                <option value="superadmin">Superadmin</option>
                <option value="supervisor">Supervisor</option>
                <option value="testigo">Testigo</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase">Nombre</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase hidden sm:table-cell">Cédula</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase hidden md:table-cell">Rol</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-variant animate-pulse shrink-0" />
                          <div className="h-4 w-36 bg-surface-variant rounded animate-pulse" />
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="h-4 w-24 bg-surface-variant rounded animate-pulse" />
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="h-6 w-20 bg-surface-variant rounded-full animate-pulse" />
                      </td>
                      <td className="p-4">
                        <div className="h-8 w-20 bg-surface-variant rounded-lg animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-on-surface-variant font-body-md">
                      No se encontraron perfiles.
                    </td>
                  </tr>
                ) : (
                  filtered.map((perfil) => (
                    <tr key={perfil.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-label-bold shrink-0">
                            {initials(perfil.nombre_completo)}
                          </div>
                          <div>
                            <div className="font-body-md text-body-md text-on-surface font-medium">
                              {perfil.nombre_completo}
                            </div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant sm:hidden">
                              {perfil.cedula}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-body-md text-body-md text-on-surface-variant hidden sm:table-cell">
                        {perfil.cedula}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ROL_COLORS[perfil.rol] ?? 'bg-surface-variant text-on-surface-variant'}`}>
                          {ROL_LABELS[perfil.rol] ?? perfil.rol}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          id={`manage-${perfil.id}`}
                          className="px-3 py-1.5 border border-primary text-primary rounded-lg font-label-bold text-label-bold hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-colors"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
