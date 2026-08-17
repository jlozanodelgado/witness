import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Testigo {
  id: string;
  nombre_completo: string;
  cedula: string;
}

interface Zona {
  id: string;
  nombre_puesto: string;
}

interface Mesa {
  id: string;
  numero_mesa: number;
  testigo_asignado_id: string | null;
  zonas_votacion: {
    nombre_puesto: string;
    municipio: string;
  } | null;
  testigo?: Testigo | null;
  total_votantes: number;
  votos_registrados: number;
  reportes_count: number;
}

interface Stats {
  testigos: number;
  mesas: number;
  votantes: number;
  reportes: number;
}

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [stats, setStats] = useState<Stats>({ testigos: 0, mesas: 0, votantes: 0, reportes: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Data for forms
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [testigosList, setTestigosList] = useState<Testigo[]>([]);

  // Form states
  const [formTestigoStatus, setFormTestigoStatus] = useState('');
  const [testigoCedula, setTestigoCedula] = useState('');
  const [testigoNombre, setTestigoNombre] = useState('');

  const [formMesaStatus, setFormMesaStatus] = useState('');
  const [mesaNumero, setMesaNumero] = useState('');
  const [mesaZonaId, setMesaZonaId] = useState('');
  const [mesaTestigoId, setMesaTestigoId] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // 1. Fetch Zonas assigned to this supervisor
      const { data: zonasData } = await supabase
        .from('zonas_votacion')
        .select('id, nombre_puesto')
        .eq('supervisor_id', user!.id);
      setZonas(zonasData || []);

      // 2. Fetch Testigos assigned to this supervisor
      const { data: testigos, error: testigosError } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, cedula')
        .eq('supervisor_id', user!.id)
        .eq('rol', 'testigo');

      if (testigosError) throw testigosError;

      const testigosData = (testigos ?? []) as Testigo[];
      setTestigosList(testigosData);
      const testigoIds = testigosData.map((t) => t.id);

      // 3. Fetch Mesas assigned to these testigos OR in zones assigned to supervisor
      // For simplicity, we just fetch mesas in the supervisor's zones
      const zonaIds = (zonasData || []).map(z => z.id);
      
      const mesasQuery = zonaIds.length > 0
        ? supabase
            .from('mesas_votacion')
            .select('id, numero_mesa, testigo_asignado_id, zona_id, zonas_votacion(nombre_puesto, municipio)')
            .in('zona_id', zonaIds)
        : supabase
            .from('mesas_votacion')
            .select('id, numero_mesa, testigo_asignado_id, zona_id, zonas_votacion(nombre_puesto, municipio)')
            .limit(0);

      const { data: mesasData, error: mesasError } = await mesasQuery;
      if (mesasError) throw mesasError;

      const mesaIds = (mesasData ?? []).map((m: any) => m.id);

      // 4. Fetch votantes counts
      const { data: votantes } = await supabase
        .from('votantes')
        .select('mesa_id, voto_registrado')
        .in('mesa_id', mesaIds.length > 0 ? mesaIds : ['00000000-0000-0000-0000-000000000000']);

      // 5. Fetch reportes
      const { data: reportes } = await supabase
        .from('reportes_mesa')
        .select('mesa_id')
        .in('mesa_id', mesaIds.length > 0 ? mesaIds : ['00000000-0000-0000-0000-000000000000']);

      // Build enriched list
      const enriched: Mesa[] = (mesasData ?? []).map((m: any) => {
        const mesaVotantes = (votantes ?? []).filter((v: any) => v.mesa_id === m.id);
        const testigo = testigosData.find((t) => t.id === m.testigo_asignado_id) ?? null;
        return {
          id: m.id,
          numero_mesa: m.numero_mesa,
          testigo_asignado_id: m.testigo_asignado_id,
          zonas_votacion: m.zonas_votacion,
          testigo,
          total_votantes: mesaVotantes.length,
          votos_registrados: mesaVotantes.filter((v: any) => v.voto_registrado).length,
          reportes_count: (reportes ?? []).filter((r: any) => r.mesa_id === m.id).length,
        };
      });

      setMesas(enriched);
      setStats({
        testigos: testigosData.length,
        mesas: enriched.length,
        votantes: (votantes ?? []).length,
        reportes: (reportes ?? []).length,
      });
    } catch (err) {
      console.error('Error cargando datos supervisor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTestigo = async () => {
    if (!testigoCedula || !testigoNombre) {
      setFormTestigoStatus('Cédula y Nombre son requeridos');
      return;
    }
    
    setFormTestigoStatus('Creando testigo...');
    const email = `${testigoCedula}@civicguard.app`;
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: testigoCedula,
      email_confirm: true,
      user_metadata: {
        nombre_completo: testigoNombre,
        rol: 'testigo',
        cedula: testigoCedula
      }
    });

    if (authError) {
      setFormTestigoStatus(`Auth Error: ${authError.message}`);
      return;
    }

    const { error: profileError } = await supabase.from('perfiles').insert({
      id: authData.user.id,
      cedula: testigoCedula,
      nombre_completo: testigoNombre,
      rol: 'testigo',
      supervisor_id: user!.id
    });

    if (profileError) {
      setFormTestigoStatus(`Error Perfil: ${profileError.message}`);
    } else {
      setFormTestigoStatus('Testigo creado exitosamente');
      setTestigoCedula('');
      setTestigoNombre('');
      fetchData(); // Refresh table
    }
  };

  const handleCrearMesa = async () => {
    if (!mesaNumero || !mesaZonaId) {
      setFormMesaStatus('Número de mesa y Zona son requeridos');
      return;
    }

    setFormMesaStatus('Creando mesa...');
    const { error } = await supabase.from('mesas_votacion').insert({
      numero_mesa: parseInt(mesaNumero),
      zona_id: mesaZonaId,
      testigo_asignado_id: mesaTestigoId || null
    });

    if (error) {
      setFormMesaStatus(`Error: ${error.message}`);
    } else {
      setFormMesaStatus('Mesa creada exitosamente');
      setMesaNumero('');
      setMesaZonaId('');
      setMesaTestigoId('');
      fetchData(); // Refresh table
    }
  };

  const filtered = mesas.filter((m) => {
    const q = search.toLowerCase();
    return (
      String(m.numero_mesa).includes(q) ||
      (m.testigo?.nombre_completo ?? '').toLowerCase().includes(q) ||
      (m.zonas_votacion?.nombre_puesto ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Supervisor Dashboard">
      <div className="max-w-[1200px] mx-auto space-y-lg">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[
            { label: 'Mis Testigos', value: stats.testigos, icon: 'group', accent: 'primary' },
            { label: 'Mesas Asignadas', value: stats.mesas, icon: 'table_bar', accent: 'primary' },
            { label: 'Total Votantes', value: stats.votantes, icon: 'how_to_reg', accent: 'primary' },
            { label: 'E‑14 Recibidos', value: stats.reportes, icon: 'description', accent: 'primary' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between h-28 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-xs">{label}</span>
                <div className="p-2 bg-primary-fixed rounded-full text-on-primary-fixed">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </div>
              </div>
              <div>
                {loading
                  ? <div className="h-8 w-16 bg-surface-variant rounded animate-pulse" />
                  : <span className="font-display text-display text-on-surface">{value.toLocaleString()}</span>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Management Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          
          {/* Testigo Form */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-on-surface">Agregar Testigo</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Cédula"
                value={testigoCedula}
                onChange={(e) => setTestigoCedula(e.target.value)}
                className="input"
              />
              <input
                type="text"
                placeholder="Nombre Completo"
                value={testigoNombre}
                onChange={(e) => setTestigoNombre(e.target.value)}
                className="input"
              />
              <button onClick={handleCrearTestigo} className="btn-primary mt-2">Crear Testigo</button>
              {formTestigoStatus && <p className="text-sm mt-2 text-primary">{formTestigoStatus}</p>}
            </div>
          </div>

          {/* Mesa Form */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-on-surface">Crear Mesa y Asignar</h3>
            <div className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Número de Mesa"
                value={mesaNumero}
                onChange={(e) => setMesaNumero(e.target.value)}
                className="input"
              />
              <select value={mesaZonaId} onChange={(e) => setMesaZonaId(e.target.value)} className="input">
                <option value="">-- Seleccionar Zona --</option>
                {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre_puesto}</option>)}
              </select>
              <select value={mesaTestigoId} onChange={(e) => setMesaTestigoId(e.target.value)} className="input">
                <option value="">-- Asignar Testigo (Opcional) --</option>
                {testigosList.map(t => <option key={t.id} value={t.id}>{t.nombre_completo}</option>)}
              </select>
              <button onClick={handleCrearMesa} className="btn-primary mt-2">Crear Mesa</button>
              {formMesaStatus && <p className="text-sm mt-2 text-primary">{formMesaStatus}</p>}
            </div>
          </div>
          
        </div>

        {/* Mesas Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col">
          <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Mesas de Votación {!loading && `(${filtered.length})`}
            </h3>
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                id="search-mesas"
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                placeholder="Buscar por mesa, testigo o puesto..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase">Mesa</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase hidden md:table-cell">Puesto / Municipio</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase hidden sm:table-cell">Testigo Asignado</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase text-center">Votantes</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase text-center hidden lg:table-cell">E‑14</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {[1,2,3,4].map((j) => (
                        <td key={j} className="p-4">
                          <div className="h-4 bg-surface-variant rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant font-body-md">
                      {mesas.length === 0
                        ? 'No tienes testigos ni mesas asignadas aún.'
                        : 'No se encontraron mesas con ese criterio.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((mesa) => (
                    <tr key={mesa.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4">
                        <span className="font-body-md text-body-md text-on-surface font-semibold">
                          Mesa #{mesa.numero_mesa}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="font-body-md text-body-md text-on-surface">
                          {mesa.zonas_votacion?.nombre_puesto ?? '—'}
                        </div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">
                          {mesa.zonas_votacion?.municipio ?? ''}
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        {mesa.testigo ? (
                          <div>
                            <div className="font-body-md text-body-md text-on-surface">{mesa.testigo.nombre_completo}</div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">{mesa.testigo.cedula}</div>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant font-label-sm italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="font-body-md text-body-md text-on-surface">
                          {mesa.votos_registrados} / {mesa.total_votantes}
                        </div>
                        {mesa.total_votantes > 0 && (
                          <div className="w-20 mx-auto bg-surface-variant rounded-full h-1.5 mt-1">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all"
                              style={{ width: `${Math.round((mesa.votos_registrados / mesa.total_votantes) * 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center hidden lg:table-cell">
                        {mesa.reportes_count > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Recibido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs">
                            <span className="material-symbols-outlined text-[14px]">pending</span>
                            Pendiente
                          </span>
                        )}
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
