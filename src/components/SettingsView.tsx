import React, { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, Save } from 'lucide-react';
import { REPAIR_STATES } from '../types/domain';
import type { ConfiguracionTaller } from '../types/domain';

interface SettingsViewProps {
  config: ConfiguracionTaller | null;
  onSave: (payload: Partial<ConfiguracionTaller>) => Promise<void>;
  onResetDemo: () => Promise<void>;
}

export function SettingsView({ config, onSave, onResetDemo }: SettingsViewProps) {
  const [form, setForm] = useState<ConfiguracionTaller | null>(config);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setForm(config);
  }, [config]);

  if (!form) {
    return <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setSavedOk(false);
    try {
      await onSave(form);
      setSavedOk(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      await onResetDemo();
      setSavedOk(true);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Configuración del taller
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Personaliza la identidad del taller, datos de contacto, horarios y plantillas de comunicación automática.
          </p>
        </div>

        <button
          type="button"
          disabled={resetting}
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{resetting ? 'Restableciendo...' : 'Restablecer datos demo'}</span>
        </button>
      </div>

      {savedOk && (
        <div
          role="status"
          className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-900 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
          <span>Configuración guardada y aplicada tanto al panel como al portal público.</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200"
      >
        {/* General Workshop Identity */}
        <div className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 font-display">
            Identidad y datos de contacto
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nombre del taller
              </label>
              <input
                type="text"
                required
                value={form.nombre_taller}
                onChange={(e) => setForm({ ...form, nombre_taller: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Teléfono de atención
              </label>
              <input
                type="text"
                required
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo de contacto
              </label>
              <input
                type="email"
                value={form.email_contacto}
                onChange={(e) => setForm({ ...form, email_contacto: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Umbral de alerta por demora (horas)
              </label>
              <input
                type="number"
                min={1}
                max={240}
                value={form.umbral_alerta_horas}
                onChange={(e) =>
                  setForm({ ...form, umbral_alerta_horas: Number(e.target.value) || 24 })
                }
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Dirección del taller
            </label>
            <input
              type="text"
              required
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Horario de apertura
            </label>
            <input
              type="text"
              required
              value={form.horario}
              onChange={(e) => setForm({ ...form, horario: e.target.value })}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Aviso de privacidad / RGPD en portal del cliente
            </label>
            <textarea
              rows={2}
              value={form.aviso_rgpd}
              onChange={(e) => setForm({ ...form, aviso_rgpd: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Automated Notification Templates */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 font-display">
              Mensajes automáticos por estado
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Variables disponibles:{' '}
              <span className="font-mono text-slate-700">
                {'{taller}, {marca}, {modelo}, {matricula}, {cliente}, {codigo}'}
              </span>
            </p>
          </div>

          <div className="space-y-3">
            {REPAIR_STATES.map((state) => (
              <div key={state}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {state}
                </label>
                <input
                  type="text"
                  value={form.plantillas_mensajes[state] || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      plantillas_mensajes: {
                        ...form.plantillas_mensajes,
                        [state]: e.target.value,
                      },
                    })
                  }
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 flex items-center justify-end rounded-b-xl">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>{saving ? 'Guardando...' : 'Guardar configuración'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
