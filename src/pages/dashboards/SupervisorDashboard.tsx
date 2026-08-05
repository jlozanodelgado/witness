import DashboardLayout from '../../components/layout/DashboardLayout';

export default function SupervisorDashboard() {
  return (
    <DashboardLayout title="Supervisor Dashboard">
      <div className="max-w-[1200px] mx-auto space-y-lg">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
          <h2 className="text-headline-lg font-headline-lg text-primary mb-2">Bienvenido Supervisor</h2>
          <p className="text-body-md text-on-surface-variant">
            Desde aquí podrás gestionar a los testigos de tu zona, asignarles sus mesas y monitorear la información electoral de tus votantes.
          </p>
          <div className="mt-8 flex gap-4">
             <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-bold hover:bg-primary-container transition-colors">
               Ver mis Testigos
             </button>
             <button className="px-4 py-2 border border-primary text-primary rounded-lg font-label-bold hover:bg-primary-fixed-dim transition-colors">
               Ver mis Zonas
             </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
