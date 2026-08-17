import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

export default function UserManagementPage() {
  const [singleEmail, setSingleEmail] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singleRole, setSingleRole] = useState('testigo');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleSingleAdd = async () => {
    if (!singleEmail || !singleName) {
      setStatus('Email and name are required');
      return;
    }
    const { error } = await supabase.from('usuarios').insert({
      email: singleEmail,
      nombre: singleName,
      rol: singleRole,
    });
    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('User added successfully');
      setSingleEmail('');
      setSingleName('');
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
        const inserts = rows.map((row) => ({
          email: row.email?.trim(),
          nombre: row.nombre?.trim(),
          rol: row.rol?.trim() ?? 'testigo',
        }));
        const { error } = await supabase.from('usuarios').upsert(inserts, { onConflict: 'email' });
        if (error) {
          setStatus(`Bulk insert error: ${error.message}`);
        } else {
          setStatus(`CSV processed. Check Supabase for accurate row count.`);
        }
      },
      error: (err: any) => {
        setStatus(`CSV parse error: ${err.message}`);
      },
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Add Single User</h3>
        <div className="flex flex-col gap-2 max-w-sm">
          <input
            type="email"
            placeholder="Email"
            value={singleEmail}
            onChange={(e) => setSingleEmail(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Name"
            value={singleName}
            onChange={(e) => setSingleName(e.target.value)}
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
          <button onClick={handleSingleAdd} className="btn-primary">
            Add User
          </button>
        </div>
      </section>
      <section>
        <h3 className="text-xl font-semibold mb-2">Bulk Upload Users (CSV)</h3>
        <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} className="mb-2" />
        <button onClick={handleCsvUpload} className="btn-primary">
          Upload CSV
        </button>
      </section>
      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </div>
  );
}
