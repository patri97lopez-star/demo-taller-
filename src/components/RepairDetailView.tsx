import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  Lock,
  Phone,
  Save,
  User,
  X,
} from 'lucide-react';
import { REPAIR_STATES } from '../types/domain';
import type {
  NotificationChannel,
  RepairFullRecord,
  RepairStatus,
} from '../types/domain';
import { formatDateTime } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface RepairDetailViewProps {
  record: RepairFullRecord;
  onBack: () => void;
  onUpdateStatus: (
    repairId: string,
    payload: {
      nuevo_estado: RepairStatus;
      observacion_publica?: string;
      observacion_privada?: string;
      fecha_estimada_entrega?: string;
      canal?: NotificationChannel;
      generar_notificacion?: boolean;
    }
  ) => Promise<void>;
  onUpdateDetails: (
    repairId: string,
    payload: {
      matricula?: string;
      marca?: string;
      modelo?: string;
      nombre_cliente?: string;
      telefono_cliente?: string;
      email_cliente?: string;
      descripcion_averia?: string;
      fecha_estimada_entrega?: string;
    }
  ) => Promise<void>;
  onDeliver: (repairId: string) => Promise<void>;
  onPreviewInPortal: (matricula: string) => void;
}

export function RepairDetailView({
  record,
  onBack,
  onUpdateStatus,
  onUpdateDetails,
  onDeliver,
  onPreviewInPortal,
}: RepairDetailViewProps) {
  const { reparacion, vehiculo, cliente, historial, notificaciones } = record;

  const [nuevoEstado, setNuevoEstado] = useState<RepairStatus>(reparacion.estado_actual);
  const [obsPublica, setObsPublica] = useState(reparacion.observaciones_publicas);
  const [obsPrivada, setObsPrivada] = useState(reparacion.observaciones_privadas);
  const [fechaEstimada, setFechaEstimada] = useState(reparacion.fecha_estimada_entrega);
  const [generarNotif, setGenerarNotif] = useState(true);
  const [canal, setCanal] = useState<NotificationChannel>('Centro Simulado');

  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Edit details modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMatricula, setEditMatricula] = useState(vehiculo.matricula);
  const [editMarca, setEditMarca] = useState(vehiculo.marca);
  const [editModelo, setEditModelo] = useState(vehiculo.modelo);
  const [editClienteNombre, setEditClienteNombre] = useState(cliente.nombre);
  const [editClienteTel, setEditClienteTel] = useState(cliente.telefono);
  const [editClienteEmail, setEditClienteEmail] = useState(cliente.email);
  const [editAveria, setEditAveria] = useState(reparacion.descripcion_averia);

  useEffect(() => {
    setNuevoEstado(reparacion.estado_actual);
    setObsPublica(reparacion.observaciones_publicas);
    setObsPrivada(reparacion.observaciones_privadas);
    setFechaEstimada(reparacion.fecha_estimada_entrega);

    setEditMatricula(vehiculo.matricula);
    setEditMarca(vehiculo.marca);
    setEditModelo(vehiculo.modelo);
    setEditClienteNombre(cliente.nombre);
    setEditClienteTel(cliente.telefono);
    setEditClienteEmail(cliente.email);
    setEditAveria(reparacion.descripcion_averia);
  }, [record, reparacion, vehiculo, cliente]);

  async function handleSaveStatus(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(null);
    try {
      await onUpdateStatus(reparacion.id, {
        nuevo_estado: nuevoEstado,
        observacion_publica: obsPublica,
        observacion_privada: obsPrivada,
        fecha_estimada_entrega: fechaEstimada,
        canal,
        generar_notificacion: generarNotif,
      });
      setSavedNotice(
        generarNotif
          ? 'Estado actualizado, historial registrado y notificación generada para el cliente.'
          : 'Estado e información actualizados correctamente.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateDetails(reparacion.id, {
        matricula: editMatricula,
        marca: editMarca,
        modelo: editModelo,
        nombre_cliente: editClienteNombre,
        telefono_cliente: editClienteTel,
        email_cliente: editClienteEmail,
        descripcion_averia: editAveria,
      });
      setEditModalOpen(false);
      setSavedNotice('Datos del vehículo y cliente actualizados.');
    } finally {
      setSaving(false);
    }
  }

  function handleCopyCode() {
    navigator.clipboard?.writeText(reparacion.codigo_seguimiento);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  const isDelivered = reparacion.estado_actual === 'Vehículo entregado';

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Volver a vehículos</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-stretch border border-slate-300 rounded-md overflow-hidden bg-white">
              <span className="bg-blue-700 text-white text-[10px] font-bold px-1.5 flex items-center justify-center">
                E
              </span>
              <span className="px-3 py-1 font-mono text-lg font-bold tracking-widest text-slate-900 tabular-nums">
                {vehiculo.matricula}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              {vehiculo.marca} {vehiculo.modelo}
            </h1>
            <StatusBadge status={reparacion.estado_actual} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="font-mono tabular-nums">
              Código: <strong className="text-slate-800">{reparacion.codigo_seguimiento}</strong>
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copiar código</span>
                </>
              )}
            </button>
            <span aria-hidden="true">·</span>
            <span>Entrada: {formatDateTime(reparacion.fecha_entrada)}</span>
            <span aria-hidden="true">·</span>
            <span>Última act.: {formatDateTime(reparacion.fecha_ultima_actualizacion)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onPreviewInPortal(vehiculo.matricula)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ver en portal cliente</span>
          </button>

          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Editar ficha</span>
          </button>

          {!isDelivered && (
            <button
              type="button"
              disabled={saving}
              onClick={() => onDeliver(reparacion.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Registrar entrega</span>
            </button>
          )}
        </div>
      </div>

      {savedNotice && (
        <div
          role="status"
          className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-900 flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Main 2-column workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Status & Notes Editor (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveStatus}
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 font-display">
                  Actualizar fase de reparación
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cada cambio se guarda con fecha/hora exacta, actualiza el portal del cliente y genera un aviso automático.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="detail-estado"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Estado actual de la reparación
                </label>
                <select
                  id="detail-estado"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as RepairStatus)}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:border-blue-600"
                >
                  {REPAIR_STATES.map((st, idx) => (
                    <option key={st} value={st}>
                      {idx + 1}. {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="detail-fecha-estimada"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Fecha estimada de entrega
                </label>
                <div className="relative">
                  <Calendar
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="detail-fecha-estimada"
                    type="datetime-local"
                    value={fechaEstimada}
                    onChange={(e) => setFechaEstimada(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="detail-obs-publica"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                <span>Observaciones públicas (visibles para el cliente)</span>
              </label>
              <textarea
                id="detail-obs-publica"
                rows={3}
                value={obsPublica}
                onChange={(e) => setObsPublica(e.target.value)}
                placeholder="Información clara para el cliente sobre el avance del vehículo..."
                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="detail-obs-privada"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span>Observaciones internas (privadas — solo visibles para el taller)</span>
              </label>
              <textarea
                id="detail-obs-privada"
                rows={3}
                value={obsPrivada}
                onChange={(e) => setObsPrivada(e.target.value)}
                placeholder="Notas técnicas internas, referencias de recambios, costes, incidencias..."
                className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generarNotif}
                    onChange={(e) => setGenerarNotif(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span>Generar notificación automática al cliente</span>
                </label>

                {generarNotif && (
                  <select
                    aria-label="Canal de notificación simulado"
                    value={canal}
                    onChange={(e) => setCanal(e.target.value as NotificationChannel)}
                    className="h-8 px-2 text-xs border border-slate-200 rounded-md bg-slate-50"
                  >
                    <option value="Centro Simulado">Centro Simulado (Demo)</option>
                    <option value="WhatsApp Business API">WhatsApp Business API (Sim.)</option>
                    <option value="Correo electrónico">Correo electrónico (Sim.)</option>
                    <option value="SMS">SMS (Sim.)</option>
                  </select>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>{saving ? 'Guardando...' : 'Guardar cambios'}</span>
              </button>
            </div>
          </form>

          {/* Status History */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 font-display">
                Historial completo de estados
              </h2>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {historial.length} registros
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {historial.map((h) => (
                <div key={h.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={h.estado} />
                      <span className="text-xs text-slate-500">por {h.autor}</span>
                    </div>
                    <p className="text-xs text-slate-700">
                      <span className="font-medium text-slate-900">Interno:</span> {h.observacion}
                    </p>
                    {h.observacion_publica && (
                      <p className="text-xs text-slate-600">
                        <span className="font-medium text-blue-700">Público:</span>{' '}
                        {h.observacion_publica}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-500 tabular-nums shrink-0">
                    {formatDateTime(h.fecha)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Client & Problem Info + Notifications generated */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 font-display">
              Descripción de la avería
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              {reparacion.descripcion_averia}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 font-display">
              Datos del cliente
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-slate-800">
                <User className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="font-medium">{cliente.nombre}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="font-mono tabular-nums">{cliente.telefono}</span>
              </div>
              <p className="text-xs text-slate-500 pl-6">
                {cliente.email || 'Sin correo electrónico registrado'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-slate-900 font-display">
                  Notificaciones enviadas
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {notificaciones.length}
              </span>
            </div>
            {notificaciones.length === 0 ? (
              <p className="p-5 text-xs text-slate-500">
                Aún no se han generado notificaciones para esta reparación.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notificaciones.map((n) => (
                  <div key={n.id} className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          n.prioritaria ? 'text-emerald-700' : 'text-blue-700'
                        }`}
                      >
                        {n.tipo} · {n.canal}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {formatDateTime(n.fecha)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{n.mensaje}</p>
                    <p className="text-[11px] text-slate-400">{n.estado_envio}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit vehicle & customer modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 font-display">
                Editar datos del vehículo y cliente
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    required
                    value={editMatricula}
                    onChange={(e) => setEditMatricula(e.target.value.toUpperCase())}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-sm font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    required
                    value={editMarca}
                    onChange={(e) => setEditMarca(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    required
                    value={editModelo}
                    onChange={(e) => setEditModelo(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cliente
                  </label>
                  <input
                    type="text"
                    required
                    value={editClienteNombre}
                    onChange={(e) => setEditClienteNombre(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    value={editClienteTel}
                    onChange={(e) => setEditClienteTel(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={editClienteEmail}
                  onChange={(e) => setEditClienteEmail(e.target.value)}
                  className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción de la avería
                </label>
                <textarea
                  rows={3}
                  required
                  value={editAveria}
                  onChange={(e) => setEditAveria(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
