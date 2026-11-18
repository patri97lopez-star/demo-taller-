import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Mail,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import type { Notificacion } from '../types/domain';
import { formatDateTime } from '../utils/formatters';

interface NotificationsViewProps {
  notifications: Notificacion[];
  loading: boolean;
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onOpenRepair: (repairId: string) => void;
}

export function NotificationsView({
  notifications,
  loading,
  onMarkRead,
  onMarkAllRead,
  onOpenRepair,
}: NotificationsViewProps) {
  const [filter, setFilter] = useState<'TODAS' | 'PRIORITARIAS' | 'NO_LEIDAS'>('TODAS');

  const filtered = useMemo(() => {
    if (filter === 'PRIORITARIAS') return notifications.filter((n) => n.prioritaria);
    if (filter === 'NO_LEIDAS') return notifications.filter((n) => !n.leida);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.leida).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Centro de notificaciones automatizadas
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Comunicaciones generadas automáticamente al cambiar el estado de cada reparación.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Marcar todas como revisadas</span>
          </button>
        )}
      </div>

      {/* Integration Architecture Readiness (honest demo status) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-900">
              <MessageSquare className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span className="text-sm font-semibold">WhatsApp Business API</span>
            </div>
            <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Modo simulación
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Plantillas listas para envío vía Webhook oficial. No se envían mensajes reales en la demo.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-900">
              <Mail className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span className="text-sm font-semibold">Correo electrónico (SMTP)</span>
            </div>
            <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Modo simulación
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Preparado para conectar servidor SMTP o proveedor transaccional al pasar a producción.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-900">
              <Smartphone className="w-4 h-4 text-slate-700" aria-hidden="true" />
              <span className="text-sm font-semibold">Pasarela SMS</span>
            </div>
            <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Modo simulación
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Arquitectura preparada para envío de avisos cortos con enlace directo de seguimiento.
          </p>
        </div>
      </div>

      {/* Filter segmented control */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setFilter('TODAS')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'TODAS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('PRIORITARIAS')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'PRIORITARIAS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Prioritarias ({notifications.filter((n) => n.prioritaria).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('NO_LEIDAS')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'NO_LEIDAS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sin revisar ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-900">
              No hay notificaciones en esta categoría
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Cuando cambies el estado de un vehículo, aquí aparecerá el mensaje automático generado.
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                n.prioritaria ? 'bg-emerald-50/40' : !n.leida ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {n.prioritaria && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                      Aviso prioritario
                    </span>
                  )}
                  <span className="font-mono font-bold text-slate-900">{n.matricula}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium text-slate-700">{n.vehiculo_texto}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600">
                    Para: <strong>{n.destinatario}</strong> ({n.telefono_destinatario})
                  </span>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed">{n.mensaje}</p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span>Canal: {n.canal}</span>
                  <span>·</span>
                  <span>Estado envío: {n.estado_envio}</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{formatDateTime(n.fecha)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenRepair(n.reparacion_id)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Ver reparación
                </button>
                {!n.leida && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(n.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Revisada</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
