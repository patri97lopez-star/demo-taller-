import { useMemo, useState } from 'react';
import { Car, Mail, Phone, Search, User, Wrench } from 'lucide-react';
import type { ClientWithDetails } from '../types/domain';
import { formatShortDate } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface ClientsViewProps {
  clients: ClientWithDetails[];
  loading: boolean;
  onOpenRepair: (repairId: string) => void;
}

export function ClientsView({ clients, loading, onOpenRepair }: ClientsViewProps) {
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.cliente.nombre.toLowerCase().includes(q) ||
        c.cliente.telefono.includes(q) ||
        c.cliente.email.toLowerCase().includes(q) ||
        c.vehiculos.some((v) => v.matricula.toLowerCase().includes(q))
    );
  }, [clients, search]);

  const selectedClient =
    clients.find((c) => c.cliente.id === selectedClientId) ?? filtered[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Gestión de clientes e historial
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Consulta los datos de contacto, vehículos asociados e historial completo de reparaciones por cliente.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente, teléfono o matrícula..."
            aria-label="Buscar cliente"
            className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="lg:col-span-2 h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-base font-semibold text-slate-900">No hay clientes que coincidan</p>
          <p className="text-sm text-slate-500 mt-1">
            Prueba con otro término de búsqueda o registra un nuevo vehículo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Client list */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {filtered.map((item) => {
              const isSelected = selectedClient?.cliente.id === item.cliente.id;
              return (
                <button
                  key={item.cliente.id}
                  type="button"
                  onClick={() => setSelectedClientId(item.cliente.id)}
                  className={`w-full text-left p-4 transition-colors flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isSelected ? 'text-blue-900' : 'text-slate-900'
                      }`}
                    >
                      {item.cliente.nombre}
                    </p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5 tabular-nums">
                      {item.cliente.telefono}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-slate-600 tabular-nums">
                      {item.vehiculos.length} {item.vehiculos.length === 1 ? 'vehículo' : 'vehículos'}
                    </span>
                    <span className="block text-[11px] text-slate-400 tabular-nums">
                      {item.reparaciones.length}{' '}
                      {item.reparaciones.length === 1 ? 'reparación' : 'reparaciones'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Client details + vehicles + repair history */}
          {selectedClient && (
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-display">
                      {selectedClient.cliente.nombre}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        {selectedClient.cliente.telefono}
                      </span>
                      {selectedClient.cliente.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                          {selectedClient.cliente.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  Alta: {formatShortDate(selectedClient.cliente.fecha_registro)}
                </span>
              </div>

              {/* Associated vehicles */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-slate-900 font-display mb-3">
                  Vehículos asociados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedClient.vehiculos.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center gap-3"
                    >
                      <Car className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {v.matricula}
                        </p>
                        <p className="text-xs text-slate-600">
                          {v.marca} {v.modelo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repair history */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-slate-900 font-display">
                    Historial de reparaciones
                  </h3>
                </div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {selectedClient.reparaciones.map(({ reparacion, vehiculo }) => (
                    <button
                      key={reparacion.id}
                      type="button"
                      onClick={() => onOpenRepair(reparacion.id)}
                      className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {vehiculo.matricula}
                          </span>
                          <span className="text-xs text-slate-600">
                            {vehiculo.marca} {vehiculo.modelo}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            · {reparacion.codigo_seguimiento}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {reparacion.descripcion_averia}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-500 tabular-nums">
                          {formatShortDate(reparacion.fecha_entrada)}
                        </span>
                        <StatusBadge status={reparacion.estado_actual} compact />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
