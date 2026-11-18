import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  CheckCircle2,
  Eye,
  Plus,
  Search,
} from 'lucide-react';
import { REPAIR_STATES } from '../types/domain';
import type { RepairFullRecord, RepairStatus } from '../types/domain';
import { formatDateTime, formatShortDate } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface VehiclesTableViewProps {
  repairs: RepairFullRecord[];
  loading: boolean;
  onOpenRepair: (repairId: string) => void;
  onQuickStatusChange: (repairId: string, nuevoEstado: RepairStatus) => Promise<void>;
  onDeliverVehicle: (repairId: string) => Promise<void>;
  onNavigateRegister: () => void;
}

export function VehiclesTableView({
  repairs,
  loading,
  onOpenRepair,
  onQuickStatusChange,
  onDeliverVehicle,
  onNavigateRegister,
}: VehiclesTableViewProps) {
  const [plateSearch, setPlateSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RepairStatus>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState<'fecha_desc' | 'fecha_asc' | 'update_desc'>('update_desc');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const pTerm = plateSearch.trim().toUpperCase();
    const cTerm = clientSearch.trim().toLowerCase();

    return repairs
      .filter((item) => {
        if (
          pTerm &&
          !item.vehiculo.matricula.toUpperCase().includes(pTerm) &&
          !item.reparacion.codigo_seguimiento.toUpperCase().includes(pTerm)
        ) {
          return false;
        }
        if (cTerm && !item.cliente.nombre.toLowerCase().includes(cTerm)) {
          return false;
        }
        if (statusFilter !== 'ALL' && item.reparacion.estado_actual !== statusFilter) {
          return false;
        }
        if (dateFilter && item.reparacion.fecha_entrada.slice(0, 10) !== dateFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'fecha_desc') {
          return (
            new Date(b.reparacion.fecha_entrada).getTime() -
            new Date(a.reparacion.fecha_entrada).getTime()
          );
        }
        if (sortBy === 'fecha_asc') {
          return (
            new Date(a.reparacion.fecha_entrada).getTime() -
            new Date(b.reparacion.fecha_entrada).getTime()
          );
        }
        return (
          new Date(b.reparacion.fecha_ultima_actualizacion).getTime() -
          new Date(a.reparacion.fecha_ultima_actualizacion).getTime()
        );
      });
  }, [repairs, plateSearch, clientSearch, statusFilter, dateFilter, sortBy]);

  async function handleStatusSelect(repairId: string, status: RepairStatus) {
    setBusyId(repairId);
    try {
      await onQuickStatusChange(repairId, status);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeliver(repairId: string) {
    setBusyId(repairId);
    try {
      await onDeliverVehicle(repairId);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Gestión de vehículos y reparaciones
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Busca por matrícula o cliente, actualiza fases al instante y registra entregas.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateRegister}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Registrar entrada</span>
        </button>
      </div>

      {/* Filters toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={plateSearch}
            onChange={(e) => setPlateSearch(e.target.value)}
            placeholder="Buscar por matrícula..."
            aria-label="Buscar por matrícula"
            className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="relative">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Buscar por cliente..."
            aria-label="Buscar por nombre del cliente"
            className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | RepairStatus)}
          aria-label="Filtrar por estado"
          className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600"
        >
          <option value="ALL">Todos los estados</option>
          {REPAIR_STATES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          aria-label="Filtrar por fecha de entrada"
          className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600"
        />

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'fecha_desc' | 'fecha_asc' | 'update_desc')
            }
            aria-label="Ordenar vehículos"
            className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600"
          >
            <option value="update_desc">Última actualización</option>
            <option value="fecha_desc">Entrada más reciente</option>
            <option value="fecha_asc">Entrada más antigua</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-slate-900">
              No se encontraron vehículos con esos criterios
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Ajusta los filtros de búsqueda o registra una nueva entrada en el taller.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {(plateSearch || clientSearch || statusFilter !== 'ALL' || dateFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setPlateSearch('');
                    setClientSearch('');
                    setStatusFilter('ALL');
                    setDateFilter('');
                  }}
                  className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Limpiar filtros
                </button>
              )}
              <button
                type="button"
                onClick={onNavigateRegister}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Registrar primer vehículo
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Matrícula / Código</th>
                  <th className="py-3 px-4">Vehículo</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Entrada</th>
                  <th className="py-3 px-4">Estado actual</th>
                  <th className="py-3 px-4">Cambio rápido</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((item) => {
                  const isBusy = busyId === item.reparacion.id;
                  const isDelivered = item.reparacion.estado_actual === 'Vehículo entregado';

                  return (
                    <tr key={item.reparacion.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onOpenRepair(item.reparacion.id)}
                          className="text-left group"
                        >
                          <span className="font-mono font-bold text-slate-900 group-hover:text-blue-600 tabular-nums">
                            {item.vehiculo.matricula}
                          </span>
                          <span className="block text-[11px] font-mono text-slate-500 tabular-nums">
                            {item.reparacion.codigo_seguimiento}
                          </span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900 whitespace-nowrap">
                          {item.vehiculo.marca} {item.vehiculo.modelo}
                        </p>
                        <p className="text-xs text-slate-500 max-w-[220px] truncate">
                          {item.reparacion.descripcion_averia}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-900">{item.cliente.nombre}</p>
                        <p className="text-xs font-mono text-slate-500 tabular-nums">
                          {item.cliente.telefono}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 tabular-nums">
                        <p>{formatShortDate(item.reparacion.fecha_entrada)}</p>
                        <p className="text-[11px] text-slate-400">
                          Act: {formatDateTime(item.reparacion.fecha_ultima_actualizacion).split(',')[1]}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={item.reparacion.estado_actual} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          aria-label={`Cambiar estado de ${item.vehiculo.matricula}`}
                          disabled={isBusy}
                          value={item.reparacion.estado_actual}
                          onChange={(e) =>
                            handleStatusSelect(item.reparacion.id, e.target.value as RepairStatus)
                          }
                          className="h-8 px-2 text-xs border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-50"
                        >
                          {REPAIR_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenRepair(item.reparacion.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Ver ficha</span>
                          </button>
                          {!isDelivered && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDeliver(item.reparacion.id)}
                              title="Registrar entrega del vehículo"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Entregar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
