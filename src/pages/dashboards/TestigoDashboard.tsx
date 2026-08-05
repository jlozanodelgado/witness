import DashboardLayout from '../../components/layout/DashboardLayout';

export default function TestigoDashboard() {
  return (
    <DashboardLayout title="Mi Puesto de Votación">
      <div className="max-w-[1200px] mx-auto space-y-lg">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-primary-fixed text-on-primary-fixed rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="material-symbols-outlined text-4xl">how_to_vote</span>
          </div>
          <h2 className="text-headline-lg font-headline-lg text-primary mb-2">Mesa 14 - Zona Norte</h2>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
            Recuerda que una vez finalice la jornada, debes tomarle la foto al formulario E-14 y registrar los totales aquí.
          </p>
          <div className="mt-8">
             <button className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-bold hover:bg-primary-container transition-colors shadow flex items-center gap-2 mx-auto">
               <span className="material-symbols-outlined">upload_file</span>
               Subir E-14 y Resultados
             </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
