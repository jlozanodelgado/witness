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

export default function TestigoDashboard() {
  const { user } = useAuth();
  const [mesa, setMesa] = useState<MesaInfo | null>(null);
  const [reporte, setReporte] = useState<ReporteExistente | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [totalVotos, setTotalVotos] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchMesa();
  }, [user]);

  const fetchMesa = async () => {
    try {
      // Get the mesa assigned to this testigo
      const { data: mesaData, error: mesaError } = await supabase
        .from('mesas_votacion')
        .select('id, numero_mesa, zonas_votacion(nombre_puesto, direccion, municipio)')
        .eq('testigo_asignado_id', user!.id)
        .maybeSingle();

      if (mesaError) throw mesaError;
      setMesa(mesaData as MesaInfo | null);

      if (mesaData) {
        // Check if a reporte already exists for this mesa/testigo
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
      }
    } catch (err) {
      console.error('Error cargando mesa del testigo:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesa || !user) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      mesa_id: mesa.id,
      testigo_id: user.id,
      total_votos: parseInt(totalVotos, 10),
      foto_formulario_url: fotoUrl || null,
      observaciones: observaciones || null,
    };

    try {
      if (reporte) {
        // Update existing
        const { error } = await supabase
          .from('reportes_mesa')
          .update(payload)
          .eq('id', reporte.id);
        if (error) throw error;
        setSuccessMsg('✅ Reporte actualizado correctamente.');
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('reportes_mesa')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setReporte(data as ReporteExistente);
        setSuccessMsg('✅ Reporte E-14 enviado correctamente.');
      }
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Error al guardar el reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Mi Puesto de Votación">
        <div className="max-w-[700px] mx-auto space-y-lg">
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
      <div className="max-w-[700px] mx-auto space-y-lg">

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

        {/* E-14 Form — only if mesa is assigned */}
        {mesa && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-md border-b border-outline-variant flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">upload_file</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {reporte ? 'Actualizar Reporte E‑14' : 'Subir Reporte E‑14'}
              </h3>
              {reporte && (
                <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Enviado
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Success / Error */}
              {successMsg && (
                <div className="p-4 rounded-lg bg-primary-fixed border border-primary/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-on-primary-fixed">check_circle</span>
                  <p className="font-label-sm font-label-bold text-on-primary-fixed">{successMsg}</p>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 rounded-lg bg-error-container border border-error/30 flex items-start gap-3">
                  <span className="material-symbols-outlined text-error">error</span>
                  <p className="font-label-sm font-label-bold text-on-error-container">{errorMsg}</p>
                </div>
              )}

              {/* Total votos */}
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
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Ej: 324"
                />
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Ingresa el total exacto de votos contabilizados en el formulario E‑14.
                </p>
              </div>

              {/* Foto URL */}
              <div className="flex flex-col gap-2">
                <label htmlFor="foto-url" className="font-label-bold text-label-bold text-on-surface">
                  URL de la Foto del Formulario
                </label>
                <input
                  id="foto-url"
                  type="url"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="https://..."
                />
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Sube la foto a Google Drive, Imgur u otro servicio y pega el enlace aquí.
                </p>
                {fotoUrl && (
                  <img
                    src={fotoUrl}
                    alt="Vista previa del formulario E-14"
                    className="mt-2 rounded-lg border border-outline-variant max-h-52 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>

              {/* Observaciones */}
              <div className="flex flex-col gap-2">
                <label htmlFor="observaciones" className="font-label-bold text-label-bold text-on-surface">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-body-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  placeholder="Incidentes, irregularidades o notas adicionales..."
                />
              </div>

              {/* Submit */}
              <button
                id="submit-e14"
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-bold text-label-bold hover:opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    {reporte ? 'Actualizar Reporte' : 'Enviar Reporte E‑14'}
                  </>
                )}
              </button>

              {reporte && (
                <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
                  Enviado el {new Date(reporte.created_at).toLocaleString('es-CO')}
                </p>
              )}
            </form>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

