import DashboardLayout from '../../components/layout/DashboardLayout';

export default function SuperadminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="max-w-[1200px] mx-auto space-y-lg">
        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {/* Stat 1 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start z-10">
              <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Testigos Activos</span>
              <div className="p-2 bg-primary-fixed rounded-full text-on-primary-fixed">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
            </div>
            <div className="z-10">
              <span className="font-display text-display text-on-surface">12,450</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px] text-green-700">trending_up</span>
                <span className="font-label-sm text-label-sm text-green-700">+4% vs. ayer</span>
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start z-10">
              <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">E-14 Recibidos</span>
              <div className="p-2 bg-primary-fixed rounded-full text-on-primary-fixed">
                <span className="material-symbols-outlined">description</span>
              </div>
            </div>
            <div className="z-10">
              <span className="font-display text-display text-on-surface">8,200</span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-full bg-surface-variant rounded-full h-1.5 mt-1">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant ml-2 shrink-0">65% meta</span>
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start z-10">
              <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Alertas Pendientes</span>
              <div className="p-2 bg-error-container rounded-full text-on-error-container">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
            <div className="z-10">
              <span className="font-display text-display text-error">42</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="font-label-sm text-label-sm text-error">12 críticas en Zona 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col">
          <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface">User Management</h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow" placeholder="Buscar por nombre o ID..." type="text"/>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select className="w-full sm:w-auto px-4 py-2 border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none appearance-none">
                  <option value="">Todas las Zonas</option>
                  <option value="1">Zona 1 - Norte</option>
                  <option value="2">Zona 2 - Sur</option>
                </select>
                <button className="px-4 py-2 border border-outline-variant rounded-lg bg-surface text-primary hover:bg-surface-container-high transition-colors flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase">Nombre</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase hidden sm:table-cell">ID</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase hidden md:table-cell">Rol</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase hidden lg:table-cell">Zona</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase">Estado</th>
                  <th className="p-4 font-label-bold text-label-bold text-on-surface-variant uppercase text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {/* Row 1 */}
                <tr className="hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-label-bold">AR</div>
                      <div>
                        <div className="font-body-md text-body-md text-on-surface font-medium">Andrés Rodríguez</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant sm:hidden">ID: 1029384756</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-body-md text-body-md text-on-surface-variant hidden sm:table-cell">1029384756</td>
                  <td className="p-4 font-body-md text-body-md text-on-surface hidden md:table-cell">Coordinador</td>
                  <td className="p-4 font-body-md text-body-md text-on-surface-variant hidden lg:table-cell">Zona 1 - Mesa 14</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span className="font-label-bold text-label-sm">Activo</span>
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1.5 border border-primary text-primary rounded-lg font-label-bold text-label-bold hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-colors">Manage</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
