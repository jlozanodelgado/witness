import { useState } from 'react';
import { supabase, supabaseAdmin } from '../lib/supabase';
import Papa from 'papaparse';

export default function UserManagementPage() {
  const [singleCedula, setSingleCedula] = useState('');
  const [singleNombreCompleto, setSingleNombreCompleto] = useState('');
  const [singleRole, setSingleRole] = useState('testigo');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleSingleAdd = async () => {
    if (!singleCedula || !singleNombreCompleto) {
      setStatus('Cédula and Nombre Completo are required');
      return;
    }
    
    // Create user via Supabase Auth Admin API
    const email = `${singleCedula}@civicguard.app`;
    const password = singleCedula;
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        nombre_completo: singleNombreCompleto,
        rol: singleRole,
        cedula: singleCedula
      }
    });

    if (authError) {
      setStatus(`Auth Error: ${authError.message}`);
      return;
    }

    // Insert into perfiles using the returned auth user ID
    const { error: profileError } = await supabase.from('perfiles').insert({
      id: authData.user.id,
      cedula: singleCedula,
      nombre_completo: singleNombreCompleto,
      rol: singleRole,
    });

    if (profileError) {
      setStatus(`Profile Error: ${profileError.message}`);
    } else {
      setStatus('Usuario creado exitosamente');
      setSingleCedula('');
      setSingleNombreCompleto('');
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setStatus('Please select a CSV file');
      return;
    }
    setStatus('Parsing CSV...');
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as Array<Record<string, any>>;
        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
          const cedula = row.cedula?.trim();
          const nombre = row.nombre_completo?.trim() || row.nombre?.trim();
          const rol = row.rol?.trim() ?? 'testigo';

          if (!cedula) continue;

          const email = `${cedula}@civicguard.app`;
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: cedula,
            email_confirm: true,
            user_metadata: { nombre_completo: nombre, rol, cedula }
          });

          if (authError) {
            console.error(`Error auth para ${cedula}:`, authError.message);
            errorCount++;
            continue;
          }

          const { error: profileError } = await supabase.from('perfiles').upsert({
            id: authData.user.id,
            cedula,
            nombre_completo: nombre,
            rol,
          }, { onConflict: 'cedula' });

          if (profileError) {
            console.error(`Error perfil para ${cedula}:`, profileError.message);
            errorCount++;
          } else {
            successCount++;
          }
        }
        
        setStatus(`CSV Procesado: ${successCount} exitosos, ${errorCount} errores.`);
      },
      error: (err: any) => {
        setStatus(`CSV parse error: ${err.message}`);
      },
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios (Perfiles)</h2>
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Agregar Perfil Individual</h3>
          <div className="flex flex-col gap-4 max-w-sm">
            <input
              type="text"
              placeholder="Cédula"
              value={singleCedula}
              onChange={(e) => setSingleCedula(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Nombre Completo"
              value={singleNombreCompleto}
              onChange={(e) => setSingleNombreCompleto(e.target.value)}
              className="input"
            />
            <select
              value={singleRole}
              onChange={(e) => setSingleRole(e.target.value)}
              className="input"
            >
              <option value="superadmin">Superadmin</option>
              <option value="supervisor">Supervisor</option>
              <option value="testigo">Testigo</option>
            </select>
            <button onClick={handleSingleAdd} className="btn-primary mt-2">
              Agregar Perfil
            </button>
          </div>
        </section>
        
        <hr className="my-6 border-outline-variant" />
        
        <section>
          <h3 className="text-xl font-semibold mb-4">Carga Masiva de Perfiles (CSV)</h3>
          <p className="text-sm text-gray-500 mb-2">
            El archivo CSV debe contener las columnas: <strong>cedula, nombre_completo, rol</strong>
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
