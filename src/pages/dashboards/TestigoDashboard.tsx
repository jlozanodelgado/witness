import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface MesaInfo {
  id: string;
  numero_mesa: number;
  zonas_votacion: {
    nombre_puesto: string;
    direccion: string;
    municipio: string;
  } | null;
}

interface ReporteExistente {
  id: string;
  total_votos: number;
  foto_formulario_url: string | null;
  observaciones: string | null;
  created_at: string;
}

interface Votante {
  id: string;
  cedula: string;
  nombre_completo: string;
  voto_registrado: boolean;
}

export default function TestigoDashboard() {
  const { user } = useAuth();
  const [mesa, setMesa] = useState<MesaInfo | null>(null);
  const [reporte, setReporte] = useState<ReporteExistente | null>(null);
  const [votantes, setVotantes] = useState<Votante[]>([]);
  const [supervisorId, setSupervisorId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // E-14 Form state
  const [totalVotos, setTotalVotos] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submittingE14, setSubmittingE14] = useState(false);
  const [successMsgE14, setSuccessMsgE14] = useState('');
  const [errorMsgE14, setErrorMsgE14] = useState('');

  // Votante Form state
  const [votanteCedula, setVotanteCedula] = useState('');
  const [votanteNombre, setVotanteNombre] = useState('');
  const [submittingVotante, setSubmittingVotante] = useState(false);
  const [statusVotante, setStatusVotante] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchMesaAndData();
  }, [user]);

  const fetchMesaAndData = async () => {
    try {
      // 1. Get supervisor_id for the testigo
      const { data: perfilData } = await supabase
        .from('perfiles')
        .select('supervisor_id')
        .eq('id', user!.id)
        .single();
        
      if (perfilData) {
        setSupervisorId(perfilData.supervisor_id);
      }

      // 2. Get the mesa assigned to this testigo
      const { data: mesaData, error: mesaError } = await supabase
        .from('mesas_votacion')
        .select('id, numero_mesa, zonas_votacion(nombre_puesto, direccion, municipio)')
        .eq('testigo_asignado_id', user!.id)
        .maybeSingle();

      if (mesaError) throw mesaError;
      setMesa(mesaData as unknown as MesaInfo | null);

      if (mesaData) {
        // 3. Fetch E-14 reporte
        const { data: reporteData } = await supabase
          .from('reportes_mesa')
          .select('id, total_votos, foto_formulario_url, observaciones, created_at')
          .eq('mesa_id', mesaData.id)
          .eq('testigo_id', user!.id)
          .maybeSingle();

        if (reporteData) {
          setReporte(reporteData as ReporteExistente);
          setTotalVotos(String(reporteData.total_votos));
          setFotoUrl(reporteData.foto_formulario_url ?? '');
          setObservaciones(reporteData.observaciones ?? '');
        }

        // 4. Fetch Votantes
        const { data: votantesData } = await supabase
          .from('votantes')
          .select('id, cedula, nombre_completo, voto_registrado')
          .eq('mesa_id', mesaData.id);

        if (votantesData) {
          setVotantes(votantesData);
        }
      }
    } catch (err) {
      console.error('Error cargando datos del testigo:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleE14Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesa || !user) return;

    setSubmittingE14(true);
    setErrorMsgE14('');
    setSuccessMsgE14('');

    const payload = {
      mesa_id: mesa.id,
      testigo_id: user.id,
      total_votos: parseInt(totalVotos, 10),
      foto_formulario_url: fotoUrl || null,
      observaciones: observaciones || null,
    };

    try {
      if (reporte) {
        const { error } = await supabase.from('reportes_mesa').update(payload).eq('id', reporte.id);
        if (error) throw error;
        setSuccessMsgE14('✅ Reporte actualizado correctamente.');
      } else {
        const { data, error } = await supabase.from('reportes_mesa').insert(payload).select().single();
        if (error) throw error;
        setReporte(data as ReporteExistente);
        setSuccessMsgE14('✅ Reporte E-14 enviado correctamente.');
      }
    } catch (err: any) {
      setErrorMsgE14(err.message ?? 'Error al guardar el reporte.');
    } finally {
      setSubmittingE14(false);
    }
  };

  const handleCrearVotante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesa || !supervisorId) {
      setStatusVotante('Falta configuración (Mesa o Supervisor no asignado)');
      return;
    }
    
    if (!votanteCedula || !votanteNombre) {
      setStatusVotante('Cédula y Nombre son requeridos');
      return;
    }

    setSubmittingVotante(true);
    setStatusVotante('Registrando...');

    const { error } = await supabase.from('votantes').insert({
      cedula: votanteCedula,
      nombre_completo: votanteNombre,
      mesa_id: mesa.id,
      supervisor_id: supervisorId,
      voto_registrado: false
    });

    setSubmittingVotante(false);

    if (error) {
      setStatusVotante(`Error: ${error.message}`);
    } else {
      setStatusVotante('✅ Votante registrado exitosamente');
      setVotanteCedula('');
      setVotanteNombre('');
      // Reload votantes list
      const { data } = await supabase.from('votantes').select('id, cedula, nombre_completo, voto_registrado').eq('mesa_id', mesa.id);
      if (data) setVotantes(data);
    }
  };

  const toggleVotoRegistrado = async (votanteId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('votantes').update({ voto_registrado: !currentStatus }).eq('id', votanteId);
    if (!error) {
      setVotantes(votantes.map(v => v.id === votanteId ? { ...v, voto_registrado: !currentStatus } : v));
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Mi Puesto de Votación">
        <div className="max-w-[1000px] mx-auto space-y-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 animate-pulse">
            <div className="h-6 bg-surface-variant rounded w-1/2 mb-4" />
            <div className="h-4 bg-surface-variant rounded w-3/4 mb-2" />
            <div className="h-4 bg-surface-variant rounded w-2/3" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mi Puesto de Votación">
      <div className="max-w-[1000px] mx-auto space-y-lg">

        {/* Mesa Info Card */}
        {mesa ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex items-start gap-4">
            <div className="w-14 h-14 bg-primary-fixed text-on-primary-fixed rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_vote</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">
                Mesa #{mesa.numero_mesa}
              </h2>
              <p className="font-body-md text-body-md text-on-surface mt-0.5">
                {mesa.zonas_votacion?.nombre_puesto ?? 'Puesto sin nombre'}
              </p>
              {mesa.zonas_votacion?.direccion && (
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {mesa.zonas_votacion.direccion} — {mesa.zonas_votacion.municipio}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">table_bar</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Sin Mesa Asignada</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Tu supervisor aún no te ha asignado una mesa. Contáctalo para que lo haga.
            </p>
          </div>
        )}

        {mesa && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            
            {/* Votantes Section */}
            <div className="space-y-lg">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
                  <span className="material-symbols-outlined text-primary">person_add</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Registrar Votante</h3>
                </div>
                <form onSubmit={handleCrearVotante} className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Cédula"
                    value={votanteCedula}
                    onChange={(e) => setVotanteCedula(e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    value={votanteNombre}
                    onChange={(e) => setVotanteNombre(e.target.value)}
                    className="input"
                  />
                  <button type="submit" disabled={submittingVotante} className="btn-primary flex items-center justify-center gap-2">
                    {submittingVotante ? 'Guardando...' : 'Agregar Votante'}
                  </button>
                  {statusVotante && <p className="text-sm text-primary font-bold">{statusVotante}</p>}
                </form>
              </div>

              {/* Lista de Votantes */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">groups</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Mis Votantes</h3>
                  </div>
                  <span className="bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded-full text-xs font-bold">
                    {votantes.length} Total
                  </span>
                </div>
                
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {votantes.length === 0 ? (
                    <p className="text-sm text-on-surface-variant italic">No hay votantes registrados.</p>
                  ) : (
                    votantes.map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-3 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                        <div>
                          <p className="font-bold text-on-surface text-sm">{v.nombre_completo}</p>
                          <p className="text-xs text-on-surface-variant">CC: {v.cedula}</p>
                        </div>
                        <button
                          onClick={() => toggleVotoRegistrado(v.id, v.voto_registrado)}
                          className={`px-3 py-1 text-xs font-bold rounded-full transition-colors flex items-center gap-1 ${
                            v.voto_registrado ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant border border-outline-variant'
                          }`}
                        >
                          {v.voto_registrado && <span className="material-symbols-outlined text-[14px]">check</span>}
                          {v.voto_registrado ? 'Ya votó' : 'Marcar Voto'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* E-14 Form Section */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl h-fit">
              <div className="p-md border-b border-outline-variant flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">upload_file</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {reporte ? 'Actualizar Reporte E‑14' : 'Subir Reporte E‑14'}
                </h3>
              </div>

              <form onSubmit={handleE14Submit} className="p-6 space-y-6">
                {successMsgE14 && (
                  <div className="p-4 rounded-lg bg-primary-fixed border border-primary/20 flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-primary-fixed">check_circle</span>
                    <p className="font-label-sm font-label-bold text-on-primary-fixed">{successMsgE14}</p>
                  </div>
                )}
                {errorMsgE14 && (
                  <div className="p-4 rounded-lg bg-error-container border border-error/30 flex items-start gap-3">
                    <span className="material-symbols-outlined text-error">error</span>
                    <p className="font-label-sm font-label-bold text-on-error-container">{errorMsgE14}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="total-votos" className="font-label-bold text-label-bold text-on-surface">
                    Total de Votos <span className="text-error">*</span>
                  </label>
                  <input
                    id="total-votos"
                    type="number"
                    min="0"
                    required
                    value={totalVotos}
                    onChange={(e) => setTotalVotos(e.target.value)}
                    className="input"
                    placeholder="Ej: 324"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="foto-url" className="font-label-bold text-label-bold text-on-surface">
                    URL de la Foto del Formulario
                  </label>
                  <input
                    id="foto-url"
                    type="url"
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    className="input"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="observaciones" className="font-label-bold text-label-bold text-on-surface">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    rows={3}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="input resize-none"
                    placeholder="Incidentes o notas adicionales..."
                  />
                </div>

                <button
                  id="submit-e14"
                  type="submit"
                  disabled={submittingE14}
                  className="btn-primary w-full flex justify-center items-center gap-2"
                >
                  {submittingE14 ? (
                    'Guardando...'
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">upload_file</span>
                      {reporte ? 'Actualizar Reporte' : 'Enviar Reporte'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
