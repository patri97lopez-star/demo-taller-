import {
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  Package,
  Wrench,
} from 'lucide-react';
import { STATUS_CONFIG } from '../types/domain';
import type { DashboardSummary } from '../types/domain';
import { formatDateTime, formatRelativeTime } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  loading: boolean;
  onOpenRepair: (repairId: string) => void;
  onNavigateVehicles: () => void;
  onNavigateRegister: () => void;
}

export function DashboardView({
  summary,
  loading,
  onOpenRepair,
  onNavigateVehicles,
  onNavigateRegister,
}: DashboardViewProps) {
  if (loading || !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'En el taller ahora',
      value: summary.kpis.en_taller,
      sub: 'Activos sin entregar',
      icon: Car,
      accent: 'text-slate-900',
    },
    {
      label: 'Pend. de diagnóstico',
      value: summary.kpis.pendiente_diagnostico,
      sub: 'En cola de revisión',
      icon: Clock,
      accent: 'text-amber-700',
    },
    {
      label: 'En reparación',
      value: summary.kpis.en_reparacion,
      sub: 'En elevador / banco',
      icon: Wrench,
      accent: 'text-blue-700',
    },
    {
      label: 'Esperando piezas',
      value: summary.kpis.esperando_piezas,
      sub: 'Recambios pedidos',
      icon: Package,
      accent: 'text-orange-700',
    },
    {
      label: 'Listos para recoger',
      value: summary.kpis.listos_para_recoger,
      sub: 'Aviso prioritario',
      icon: CheckCircle2,
      accent: 'text-emerald-700',
    },
    {
      label: 'Entregados',
      value: summary.kpis.entregados,
      sub: 'Histórico cerrado',
      icon: CheckCircle2,
      accent: 'text-slate-600',
    },
  ];

  const maxStageCount = Math.max(
    1,
    ...summary.distribucion_estados.map((d) => d.cantidad)
  );
  const maxDailyCount = Math.max(
    1,
    ...summary.entradas_recientes_por_dia.map((d) => d.cantidad)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Estado operativo del taller
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Resumen en tiempo real de vehículos, fases de reparación y alertas de seguimiento.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateVehicles}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
        >
          <span>Ver tabla completa</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* 6 KPI Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
                <Icon className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              </div>
              <p className={`mt-3 text-3xl font-bold font-mono tabular-nums ${card.accent}`}>
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Stale phase alerts (if any) */}
      {summary.alertas_demora.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2.5 text-amber-900 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
            <h2 className="text-sm font-semibold font-display">
              Avisos de vehículos con demora en la misma fase
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.alertas_demora.map(({ record, horas_en_fase }) => (
              <button
                key={record.reparacion.id}
                type="button"
                onClick={() => onOpenRepair(record.reparacion.id)}
                className="text-left bg-white border border-amber-200 hover:border-amber-400 rounded-lg p-3.5 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {record.vehiculo.matricula}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {record.vehiculo.marca} {record.vehiculo.modelo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Cliente: {record.cliente.nombre} · Fase: {record.reparacion.estado_actual}
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded shrink-0 tabular-nums">
                  {horas_en_fase} h sin cambio
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase distribution bar chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 font-display">
                Distribución por estado de reparación
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Vehículos registrados según fase actual en el flujo del taller
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              Total: {summary.kpis.total_registrados}
            </span>
          </div>

          <div className="space-y-2.5">
            {summary.distribucion_estados
              .filter((item) => item.cantidad > 0 || item.estado === 'En reparación' || item.estado === 'Pendiente de diagnóstico' || item.estado === 'Esperando piezas' || item.estado === 'Listo para recoger')
              .map((item) => {
                const widthPct = Math.round((item.cantidad / maxStageCount) * 100);
                const cfg = STATUS_CONFIG[item.estado];
                return (
                  <div key={item.estado} className="grid grid-cols-12 items-center gap-3 text-xs">
                    <span className="col-span-5 sm:col-span-4 text-slate-700 font-medium truncate">
                      {cfg.label}
                    </span>
                    <div className="col-span-6 sm:col-span-7 h-6 bg-slate-100 rounded-md overflow-hidden flex items-center">
                      <div
                        className={`h-full rounded-md transition-all duration-300 ${
                          item.estado === 'Listo para recoger'
                            ? 'bg-emerald-600'
                            : item.estado === 'Esperando piezas'
                              ? 'bg-amber-500'
                              : item.estado === 'Vehículo entregado'
                                ? 'bg-slate-400'
                                : 'bg-blue-600'
                        }`}
                        style={{ width: `${item.cantidad > 0 ? Math.max(widthPct, 6) : 0}%` }}
                      />
                    </div>
                    <span className="col-span-1 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {item.cantidad}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 7-day intake SVG chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 font-display">
              Entradas últimos 7 días
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ritmo diario de recepción de vehículos
            </p>
          </div>

          <div className="mt-6 h-44 flex items-end justify-between gap-2 pt-4 border-b border-slate-200">
            {summary.entradas_recientes_por_dia.map((day) => {
              const barHeightPct = Math.round((day.cantidad / maxDailyCount) * 100);
              return (
                <div
                  key={day.fecha}
                  className="flex-1 flex flex-col items-center justify-end h-full gap-1.5"
                >
                  <span className="text-[11px] font-mono text-slate-700 tabular-nums">
                    {day.cantidad > 0 ? day.cantidad : ''}
                  </span>
                  <div className="w-full max-w-[30px] flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        day.cantidad > 0 ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                      style={{ height: `${day.cantidad > 0 ? Math.max(barHeightPct, 14) : 6}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
            {summary.entradas_recientes_por_dia.map((day) => (
              <span key={day.fecha} className="flex-1 text-center truncate">
                {day.etiqueta}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 3 columns: Latest registered, Pending jobs summary, Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimos vehículos registrados */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 font-display">
              Últimos vehículos registrados
            </h2>
            <button
              type="button"
              onClick={onNavigateRegister}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              + Nuevo
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {summary.ultimos_vehiculos.map((item) => (
              <button
                key={item.reparacion.id}
                type="button"
                onClick={() => onOpenRepair(item.reparacion.id)}
                className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {item.vehiculo.matricula}
                    </span>
                    <span className="text-xs text-slate-600 truncate">
                      {item.vehiculo.marca} {item.vehiculo.modelo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {item.cliente.nombre} · {formatRelativeTime(item.reparacion.fecha_entrada)}
                  </p>
                </div>
                <StatusBadge status={item.reparacion.estado_actual} compact />
              </button>
            ))}
          </div>
        </div>

        {/* Resumen de trabajos pendientes */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 font-display">
              Resumen de trabajos pendientes
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {summary.trabajos_pendientes.length} activos
            </span>
          </div>
          {summary.trabajos_pendientes.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No hay trabajos pendientes en curso.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {summary.trabajos_pendientes.map((item) => (
                <button
                  key={item.reparacion.id}
                  type="button"
                  onClick={() => onOpenRepair(item.reparacion.id)}
                  className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900">
                      <span className="font-mono">{item.vehiculo.matricula}</span> ·{' '}
                      {item.vehiculo.marca} {item.vehiculo.modelo}
                    </span>
                    <StatusBadge status={item.reparacion.estado_actual} compact />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {item.reparacion.descripcion_averia}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900 font-display">
              Actividad reciente
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {summary.actividad_reciente.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => onOpenRepair(act.reparacion_id)}
                className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900">
                    <span className="font-mono">{act.matricula}</span> · {act.estado}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums shrink-0">
                    {formatDateTime(act.fecha).split(',')[1]}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{act.observacion}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
