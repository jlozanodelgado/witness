import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

export default function ZoneManagementPage() {
  const [singleNombrePuesto, setSingleNombrePuesto] = useState('');
  const [singleDireccion, setSingleDireccion] = useState('');
  const [singleMunicipio, setSingleMunicipio] = useState('');
  const [singleDepartamento, setSingleDepartamento] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

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
    });
    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('Zona agregada exitosamente');
      setSingleNombrePuesto('');
      setSingleDireccion('');
      setSingleMunicipio('');
      setSingleDepartamento('');
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
        }));
        
        // Note: Assuming 'nombre_puesto' is unique if we use upsert. 
        // Or if there is no unique constraint on it, we might just need to insert.
        // If there's no unique constraint on 'nombre_puesto' in your DB, you may need to use insert() instead of upsert().
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
            <button onClick={handleSingleAdd} className="btn-primary mt-2">
              Agregar Zona
            </button>
          </div>
        </section>
        
        <hr className="my-6 border-outline-variant" />
        
        <section>
          <h3 className="text-xl font-semibold mb-4">Carga Masiva de Zonas (CSV)</h3>
          <p className="text-sm text-gray-500 mb-2">
            El archivo CSV debe contener las columnas: <strong>nombre_puesto, direccion, municipio, departamento</strong>
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
