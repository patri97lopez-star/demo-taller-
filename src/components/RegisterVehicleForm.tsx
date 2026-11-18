import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';
import type { ClientWithDetails, RepairStatus } from '../types/domain';
import { normalizeLicensePlate, toLocalDateTimeInput } from '../utils/formatters';

interface RegisterVehicleFormProps {
  existingClients: ClientWithDetails[];
  onSubmit: (payload: {
    matricula: string;
    marca: string;
    modelo: string;
    nombre_cliente: string;
    telefono_cliente: string;
    email_cliente?: string;
    fecha_entrada: string;
    fecha_estimada_entrega?: string;
    descripcion_averia: string;
    observaciones_privadas: string;
    observaciones_publicas?: string;
    estado_inicial?: RepairStatus;
  }) => Promise<void>;
  onCancel: () => void;
}

export function RegisterVehicleForm({
  existingClients,
  onSubmit,
  onCancel,
}: RegisterVehicleFormProps) {
  const [matricula, setMatricula] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [fechaEntrada, setFechaEntrada] = useState(() => toLocalDateTimeInput());
  const [fechaEstimada, setFechaEstimada] = useState('');
  const [estadoInicial, setEstadoInicial] = useState<RepairStatus>('Pendiente de diagnóstico');
  const [descripcionAveria, setDescripcionAveria] = useState('');
  const [observacionesPrivadas, setObservacionesPrivadas] = useState('');
  const [observacionesPublicas, setObservacionesPublicas] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSelectExistingClient(clientId: string) {
    const found = existingClients.find((c) => c.cliente.id === clientId);
    if (!found) return;
    setNombreCliente(found.cliente.nombre);
    setTelefonoCliente(found.cliente.telefono);
    setEmailCliente(found.cliente.email);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.nombreCliente;
      delete next.telefonoCliente;
      return next;
    });
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    const plate = normalizeLicensePlate(matricula);
    if (!plate || plate.length < 4) {
      nextErrors.matricula = 'Introduce una matrícula válida (mínimo 4 caracteres).';
    }
    if (!marca.trim()) nextErrors.marca = 'La marca es obligatoria.';
    if (!modelo.trim()) nextErrors.modelo = 'El modelo es obligatorio.';
    if (!nombreCliente.trim()) nextErrors.nombreCliente = 'El nombre del cliente es obligatorio.';
    if (!telefonoCliente.trim() || telefonoCliente.replace(/\D/g, '').length < 9) {
      nextErrors.telefonoCliente = 'Introduce un teléfono de contacto válido (mínimo 9 dígitos).';
    }
    if (emailCliente.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCliente.trim())) {
      nextErrors.emailCliente = 'El formato del correo electrónico no es válido.';
    }
    if (!fechaEntrada) nextErrors.fechaEntrada = 'La fecha y hora de entrada son obligatorias.';
    if (!descripcionAveria.trim()) {
      nextErrors.descripcionAveria = 'Describe el problema o avería reportado.';
    }
    if (!observacionesPrivadas.trim()) {
      nextErrors.observacionesPrivadas =
        'Introduce observaciones internas iniciales (ej. kilometraje, nivel de combustible o notas de recepción).';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        matricula: normalizeLicensePlate(matricula),
        marca: marca.trim(),
        modelo: modelo.trim(),
        nombre_cliente: nombreCliente.trim(),
        telefono_cliente: telefonoCliente.trim(),
        email_cliente: emailCliente.trim() || undefined,
        fecha_entrada: fechaEntrada,
        fecha_estimada_entrega: fechaEstimada || undefined,
        descripcion_averia: descripcionAveria.trim(),
        observaciones_privadas: observacionesPrivadas.trim(),
        observaciones_publicas: observacionesPublicas.trim() || undefined,
        estado_inicial: estadoInicial,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'No se pudo guardar el registro del vehículo.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Volver al listado</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Registrar entrada de vehículo
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Se generará automáticamente un código único de seguimiento y la primera notificación al cliente.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleFormSubmit}
        noValidate
        className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200"
      >
        {/* Vehicle section */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900 font-display">
              1. Datos del vehículo y entrada
            </h2>
            <span className="text-xs text-slate-500">Campos marcados con * son obligatorios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="reg-matricula"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Matrícula *
              </label>
              <input
                id="reg-matricula"
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                placeholder="1234ABC"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-blue-600"
              />
              {errors.matricula && (
                <p className="mt-1 text-xs text-red-600">{errors.matricula}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-marca"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Marca *
              </label>
              <input
                id="reg-marca"
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej. Volkswagen"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
              {errors.marca && <p className="mt-1 text-xs text-red-600">{errors.marca}</p>}
            </div>

            <div>
              <label
                htmlFor="reg-modelo"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Modelo *
              </label>
              <input
                id="reg-modelo"
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ej. Golf"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
              {errors.modelo && <p className="mt-1 text-xs text-red-600">{errors.modelo}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="reg-fecha-entrada"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Fecha y hora de entrada *
              </label>
              <input
                id="reg-fecha-entrada"
                type="datetime-local"
                value={fechaEntrada}
                onChange={(e) => setFechaEntrada(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
              />
              {errors.fechaEntrada && (
                <p className="mt-1 text-xs text-red-600">{errors.fechaEntrada}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-estado-inicial"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Estado inicial en taller
              </label>
              <select
                id="reg-estado-inicial"
                value={estadoInicial}
                onChange={(e) => setEstadoInicial(e.target.value as RepairStatus)}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Pendiente de diagnóstico">Pendiente de diagnóstico</option>
                <option value="Vehículo recibido">Vehículo recibido</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-fecha-estimada"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Entrega estimada (opcional)
              </label>
              <input
                id="reg-fecha-estimada"
                type="datetime-local"
                value={fechaEstimada}
                onChange={(e) => setFechaEstimada(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Client section */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900 font-display">
              2. Datos del cliente
            </h2>
            {existingClients.length > 0 && (
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                <select
                  aria-label="Rellenar con cliente existente"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) handleSelectExistingClient(e.target.value);
                  }}
                  className="h-8 px-2.5 border border-slate-200 rounded-md text-xs bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="">Seleccionar cliente ya registrado...</option>
                  {existingClients.map((c) => (
                    <option key={c.cliente.id} value={c.cliente.id}>
                      {c.cliente.nombre} ({c.cliente.telefono})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="reg-cliente-nombre"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Nombre del cliente *
              </label>
              <input
                id="reg-cliente-nombre"
                type="text"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Ej. Ana García"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
              {errors.nombreCliente && (
                <p className="mt-1 text-xs text-red-600">{errors.nombreCliente}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-cliente-tel"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Teléfono del cliente *
              </label>
              <input
                id="reg-cliente-tel"
                type="tel"
                value={telefonoCliente}
                onChange={(e) => setTelefonoCliente(e.target.value)}
                placeholder="600 123 456"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
              />
              {errors.telefonoCliente && (
                <p className="mt-1 text-xs text-red-600">{errors.telefonoCliente}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-cliente-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Correo electrónico (opcional)
              </label>
              <input
                id="reg-cliente-email"
                type="email"
                value={emailCliente}
                onChange={(e) => setEmailCliente(e.target.value)}
                placeholder="cliente@correo.es"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
              {errors.emailCliente && (
                <p className="mt-1 text-xs text-red-600">{errors.emailCliente}</p>
              )}
            </div>
          </div>
        </div>

        {/* Technical notes section */}
        <div className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 font-display">
            3. Avería y observaciones
          </h2>

          <div>
            <label
              htmlFor="reg-averia"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Descripción del problema o avería *
            </label>
            <textarea
              id="reg-averia"
              rows={3}
              value={descripcionAveria}
              onChange={(e) => setDescripcionAveria(e.target.value)}
              placeholder="Ej. Testigo de fallo motor encendido y tirones en frío."
              className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
            />
            {errors.descripcionAveria && (
              <p className="mt-1 text-xs text-red-600">{errors.descripcionAveria}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-obs-privadas"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Observaciones internas (solo taller) *
              </label>
              <textarea
                id="reg-obs-privadas"
                rows={3}
                value={observacionesPrivadas}
                onChange={(e) => setObservacionesPrivadas(e.target.value)}
                placeholder="Ej. 112.400 km, depósito al 50%, asignar a elevador 1."
                className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
              />
              {errors.observacionesPrivadas && (
                <p className="mt-1 text-xs text-red-600">{errors.observacionesPrivadas}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-obs-publicas"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Observaciones públicas para el cliente (opcional)
              </label>
              <textarea
                id="reg-obs-publicas"
                rows={3}
                value={observacionesPublicas}
                onChange={(e) => setObservacionesPublicas(e.target.value)}
                placeholder="Mensaje visible en el portal público del cliente..."
                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {submitError && (
            <div
              role="alert"
              className="p-3 rounded-lg border border-red-200 bg-red-50 flex items-center gap-2 text-xs font-medium text-red-800"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>{submitting ? 'Guardando...' : 'Guardar entrada en taller'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
