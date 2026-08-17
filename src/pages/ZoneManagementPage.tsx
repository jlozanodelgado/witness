import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

export default function ZoneManagementPage() {
  const [singleName, setSingleName] = useState('');
  const [singleAddress, setSingleAddress] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleSingleAdd = async () => {
    if (!singleName) {
      setStatus('Name is required');
      return;
    }
    const { error } = await supabase.from('zonas_votacion').insert({
      nombre: singleName,
      direccion: singleAddress,
    });
    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('Zone added successfully');
      setSingleName('');
      setSingleAddress('');
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
          nombre: row.nombre?.trim(),
          direccion: row.direccion?.trim(),
        }));
        const { error } = await supabase.from('zonas_votacion').upsert(inserts, { onConflict: 'nombre' });
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
      <h2 className="text-2xl font-bold mb-4">Zone Management</h2>
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Add Single Zone</h3>
        <div className="flex flex-col gap-2 max-w-sm">
          <input
            type="text"
            placeholder="Name"
            value={singleName}
            onChange={(e) => setSingleName(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Address"
            value={singleAddress}
            onChange={(e) => setSingleAddress(e.target.value)}
            className="input"
          />
          <button onClick={handleSingleAdd} className="btn-primary">
            Add Zone
          </button>
        </div>
      </section>
      <section>
        <h3 className="text-xl font-semibold mb-2">Bulk Upload Zones (CSV)</h3>
        <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} className="mb-2" />
        <button onClick={handleCsvUpload} className="btn-primary">
          Upload CSV
        </button>
      </section>
      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </div>
  );
}
