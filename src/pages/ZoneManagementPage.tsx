import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

interface Supervisor {
  id: string;
  nombre_completo: string;
}

export default function ZoneManagementPage() {
  const [singleNombrePuesto, setSingleNombrePuesto] = useState('');
  const [singleDireccion, setSingleDireccion] = useState('');
  const [singleMunicipio, setSingleMunicipio] = useState('');
  const [singleDepartamento, setSingleDepartamento] = useState('');
  const [singleSupervisorId, setSingleSupervisorId] = useState('');
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    fetchSupervisores();
  }, []);

  const fetchSupervisores = async () => {
    const { data } = await supabase
      .from('perfiles')
      .select('id, nombre_completo')
      .eq('rol', 'supervisor');
    if (data) setSupervisores(data as Supervisor[]);
  };

  const handleSingleAdd = async () => {
    if (!singleNombrePuesto) {
      setStatus('El nombre del puesto es requerido');
      return;
    }
    const { error } = await supabase.from('zonas_votacion').insert({
      nombre_puesto: singleNombrePuesto,
      direccion: singleDireccion,
      municipio: singleMunicipio,
      departamento: singleDepartamento,
      supervisor_id: singleSupervisorId || null,
    });
    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('Zona agregada exitosamente');
      setSingleNombrePuesto('');
      setSingleDireccion('');
      setSingleMunicipio('');
      setSingleDepartamento('');
      setSingleSupervisorId('');
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setStatus('Por favor seleccione un archivo CSV');
      return;
    }
    setStatus('Procesando CSV...');
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as Array<Record<string, any>>;
        const inserts = rows.map((row) => ({
          nombre_puesto: row.nombre_puesto?.trim() || row.nombre?.trim(),
          direccion: row.direccion?.trim(),
          municipio: row.municipio?.trim(),
          departamento: row.departamento?.trim(),
          supervisor_id: row.supervisor_id?.trim() || null,
        }));
        
        const { error } = await supabase.from('zonas_votacion').insert(inserts);
        
        if (error) {
          setStatus(`Error en carga masiva: ${error.message}`);
        } else {
          setStatus(`CSV procesado exitosamente.`);
        }
      },
      error: (err: any) => {
        setStatus(`Error al leer CSV: ${err.message}`);
      },
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Gestión de Zonas de Votación</h2>
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Agregar Zona Individual</h3>
          <div className="flex flex-col gap-4 max-w-sm">
            <input
              type="text"
              placeholder="Nombre del Puesto"
              value={singleNombrePuesto}
              onChange={(e) => setSingleNombrePuesto(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Dirección"
              value={singleDireccion}
              onChange={(e) => setSingleDireccion(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Municipio"
              value={singleMunicipio}
              onChange={(e) => setSingleMunicipio(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Departamento"
              value={singleDepartamento}
              onChange={(e) => setSingleDepartamento(e.target.value)}
              className="input"
            />
            <select
              value={singleSupervisorId}
              onChange={(e) => setSingleSupervisorId(e.target.value)}
              className="input"
            >
              <option value="">-- Sin asignar (Opcional) --</option>
              {supervisores.map((sup) => (
                <option key={sup.id} value={sup.id}>{sup.nombre_completo}</option>
              ))}
            </select>
            <button onClick={handleSingleAdd} className="btn-primary mt-2">
              Agregar Zona
            </button>
          </div>
        </section>
        
        <hr className="my-6 border-outline-variant" />
        
        <section>
          <h3 className="text-xl font-semibold mb-4">Carga Masiva de Zonas (CSV)</h3>
          <p className="text-sm text-gray-500 mb-2">
            El archivo CSV debe contener las columnas: <strong>nombre_puesto, direccion, municipio, departamento, supervisor_id</strong> (opcional)
          </p>
          <div className="flex flex-col gap-4 max-w-sm">
            <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} className="file:btn-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:cursor-pointer" />
            <button onClick={handleCsvUpload} className="btn-primary">
              Cargar CSV
            </button>
          </div>
        </section>
        
        {status && (
          <div className="mt-6 p-4 rounded bg-primary-container text-on-primary-container">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
