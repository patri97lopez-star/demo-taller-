import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { PUBLIC_TIMELINE_STEPS, STATUS_CONFIG } from '../types/domain';
import type { PublicTrackingResult, PublicWorkshopInfo } from '../types/domain';
import { formatDateTime, formatRelativeTime } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface ClientTrackerToolProps {
  initialQuery?: string;
  onWorkshopLoaded?: (info: PublicWorkshopInfo) => void;
}

const DEMO_PLATES = [
  { plate: '1234ABC', label: '1234ABC · VW Golf' },
  { plate: '5678DEF', label: '5678DEF · Seat León' },
  { plate: '9012GHI', label: '9012GHI · BMW Serie 3' },
  { plate: '3456JKL', label: '3456JKL · Toyota Corolla' },
];

export function ClientTrackerTool({
  initialQuery = '',
  onWorkshopLoaded,
}: ClientTrackerToolProps) {
  const [workshop, setWorkshop] = useState<PublicWorkshopInfo | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicTrackingResult | null>(null);

  useEffect(() => {
    api
      .getPublicConfig()
      .then((info) => {
        setWorkshop(info);
        onWorkshopLoaded?.(info);
      })
      .catch(() => {
        // Ignore initial load error
      });
  }, [onWorkshopLoaded]);

  useEffect(() => {
    if (initialQuery.trim()) {
      setQuery(initialQuery);
      handleLookup(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function handleLookup(searchText: string) {
    const trimmed = searchText.trim();
    if (!trimmed) {
      setError('Introduce la matrícula de tu vehículo o tu código de seguimiento.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.trackVehicle(trimmed);
      setResult(data);
      setWorkshop(data.taller);
      onWorkshopLoaded?.(data.taller);
    } catch (err) {
      setResult(null);
      setError(
        err instanceof Error
          ? err.message
          : 'No hemos encontrado ningún vehículo asociado a esta matrícula. Comprueba los datos o contacta con tu taller.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLookup(query);
  }

  const currentStage = result ? STATUS_CONFIG[result.estado_actual].timelineStage : -1;
  const isDelivered = result?.estado_actual === 'Vehículo entregado';
  const isReady = result?.estado_actual === 'Listo para recoger';
  const needsAuth =
    result?.estado_actual === 'Esperando autorización del cliente' ||
    result?.estado_actual === 'Presupuesto pendiente de aprobación';

  return (
    <div className="space-y-8">
      {/* Search Box Header */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-medium text-blue-600 mb-2">
          {workshop?.nombre_taller || 'Portal público de consulta'}
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display text-balance">
          ¿Cómo va tu coche?
        </h3>
        <p className="mt-2.5 text-sm sm:text-base text-slate-600">
          Consulta el estado de reparación de tu vehículo sin necesidad de llamar al taller.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <Search
            className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Introduce tu matrícula (ej. 1234ABC) o código TT-2026-..."
            aria-label="Matrícula o código de seguimiento"
            className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-lg text-base font-mono uppercase tracking-wider text-slate-900 placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {loading ? 'Consultando...' : 'Consultar estado'}
        </button>
      </form>

      {/* Quick demo test buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
        <span>Escribe cualquier matrícula o prueba estas de ejemplo:</span>
        {DEMO_PLATES.map((demo) => (
          <button
            key={demo.plate}
            type="button"
            onClick={() => {
              setQuery(demo.plate);
              handleLookup(demo.plate);
            }}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:border-blue-600 hover:text-blue-700 text-slate-700 font-mono transition-colors"
          >
            {demo.label}
          </button>
        ))}
      </div>

      {/* Not found alert */}
      {error && (
        <div
          role="alert"
          className="max-w-2xl mx-auto p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3 text-left"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
            {workshop?.telefono && (
              <p className="mt-1 text-xs text-red-700">
                Teléfono de atención del taller:{' '}
                <span className="font-mono font-semibold">{workshop.telefono}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Live Vehicle Result Card */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-left">
          {result.es_simulacion_prototipo && (
            <div className="px-6 sm:px-8 py-3 bg-blue-50 border-b border-blue-200 text-xs text-blue-900">
              Vista de prueba del prototipo para la matrícula{' '}
              <span className="font-mono font-bold">{result.matricula}</span>: estado simulado automáticamente para demostración. Si das de alta esta matrícula en el Panel del Taller, verás su ficha real.
            </div>
          )}
          <div className="p-6 sm:p-8 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-stretch border border-slate-300 rounded-md overflow-hidden bg-white">
                  <span className="bg-blue-700 text-white text-[10px] font-bold px-1.5 flex items-center justify-center">
                    E
                  </span>
                  <span className="px-3 py-1 font-mono text-lg font-bold tracking-widest text-slate-900 tabular-nums">
                    {result.matricula}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  Código {result.codigo_seguimiento}
                </span>
              </div>

              <h4 className="mt-3 text-2xl font-bold text-slate-900 font-display">
                {result.marca} {result.modelo}
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                {STATUS_CONFIG[result.estado_actual].description}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <StatusBadge status={result.estado_actual} />
              <p className="text-xs text-slate-500 tabular-nums">
                Última actualización: {formatDateTime(result.fecha_ultima_actualizacion)} (
                {formatRelativeTime(result.fecha_ultima_actualizacion)})
              </p>
            </div>
          </div>

          {isReady && (
            <div className="px-6 sm:px-8 py-4 bg-emerald-50 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                <p className="text-sm font-semibold text-emerald-900">
                  Tu vehículo está terminado y disponible para recogida en{' '}
                  {result.taller.nombre_taller}.
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-800 whitespace-nowrap">
                {result.taller.horario}
              </span>
            </div>
          )}

          {needsAuth && (
            <div className="px-6 sm:px-8 py-4 bg-orange-50 border-b border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-700 shrink-0" aria-hidden="true" />
                <p className="text-sm font-medium text-orange-900">
                  Tu vehículo requiere tu validación o autorización para continuar con la siguiente fase.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-orange-900 whitespace-nowrap">
                Tel. {result.taller.telefono}
              </span>
            </div>
          )}

          {/* 3-stage visual timeline */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h5 className="text-sm font-semibold text-slate-900 font-display">
                Línea temporal de la reparación
              </h5>
              <span className="text-xs text-slate-500 tabular-nums">
                {isDelivered
                  ? 'Proceso completado y entregado'
                  : `Fase ${currentStage + 1} de ${PUBLIC_TIMELINE_STEPS.length}`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PUBLIC_TIMELINE_STEPS.map((step) => {
                const completed = isDelivered || step.stage < currentStage;
                const active = !isDelivered && step.stage === currentStage;

                return (
                  <div
                    key={step.stage}
                    className={`rounded-lg border p-3.5 transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-50/70'
                        : completed
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-semibold ${
                          active
                            ? 'bg-blue-600 text-white'
                            : completed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {completed ? (
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          step.stage + 1
                        )}
                      </span>
                      <span
                        className={`text-[11px] font-medium ${
                          active
                            ? 'text-blue-700'
                            : completed
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                        }`}
                      >
                        {active ? 'Actual' : completed ? 'Hecho' : 'Pendiente'}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        active || completed ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dates & Public Observations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            <div className="p-6 sm:p-8 space-y-5">
              <h5 className="text-sm font-semibold text-slate-900 font-display">
                Fechas del servicio
              </h5>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-500">Fecha de entrada</p>
                    <p className="text-sm font-medium text-slate-900 tabular-nums">
                      {formatDateTime(result.fecha_entrada)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-500">Fecha estimada de entrega</p>
                    <p className="text-sm font-medium text-slate-900 tabular-nums">
                      {result.fecha_estimada_entrega
                        ? formatDateTime(result.fecha_estimada_entrega)
                        : 'Pendiente de confirmación tras diagnóstico'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:col-span-2 space-y-5">
              <div>
                <h5 className="text-sm font-semibold text-slate-900 font-display mb-2">
                  Observaciones públicas del taller
                </h5>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-4">
                  {result.observaciones_publicas ||
                    'Sin observaciones adicionales en este momento.'}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-slate-900 font-display mb-2.5">
                  Historial de actualizaciones
                </h5>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {result.historial_publico.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{item.estado}</p>
                        {item.observacion_publica && item.observacion_publica !== item.estado && (
                          <p className="text-xs text-slate-600 mt-0.5">
                            {item.observacion_publica}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
                        {formatDateTime(item.fecha)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
