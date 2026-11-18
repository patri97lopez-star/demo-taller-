import React, { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface AdminLoginProps {
  onSuccess: (session: { usuario: string; rol: string }) => void;
  onBackToPortal: () => void;
}

export function AdminLogin({ onSuccess, onBackToPortal }: AdminLoginProps) {
  const [usuario, setUsuario] = useState('demo');
  const [password, setPassword] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ usuario, password });
      onSuccess({ usuario: res.usuario, rol: res.rol });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoAccess() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ demoQuickAccess: true });
      onSuccess({ usuario: res.usuario, rol: res.rol });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la sesión demo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left visual panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-slate-900 text-white overflow-hidden">
        {!imgFailed ? (
          <img
            src="/src/assets/images/taller_mecanico_moderno_1794914054212.jpg"
            alt="Instalaciones modernas de taller mecánico"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-slate-950/60" />

        <div className="relative z-10 p-10">
          <p className="text-xl font-bold tracking-tight font-display">TALLER TRACK</p>
        </div>

        <div className="relative z-10 p-10 max-w-xl">
          <h2 className="text-3xl font-bold leading-tight text-balance font-display">
            Menos llamadas preguntando por tu coche. Más tiempo para reparar.
          </h2>
          <p className="mt-4 text-sm text-slate-200 leading-relaxed">
            Centraliza la recepción de vehículos, actualiza el estado de cada reparación en segundos y mantén informados a tus clientes de forma automática.
          </p>
          <div className="mt-8 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
            <span>Entorno de gestión privada del taller</span>
            <span>Desarrollado por TEMIS ATRILE</span>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex flex-col justify-between p-6 sm:p-12 bg-slate-50 lg:bg-white">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToPortal}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Volver al portal del cliente</span>
          </button>
          <span className="lg:hidden text-sm font-bold text-slate-900 font-display">
            TALLER TRACK
          </span>
        </div>

        <div className="w-full max-w-md mx-auto my-12 bg-white lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-xl border border-slate-200 lg:border-0">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-6">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Panel de administración del taller
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Acceso reservado para propietarios, jefes de taller y personal de recepción.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Usuario o correo de acceso
              </label>
              <input
                id="login-email"
                type="text"
                required
                placeholder="Ej. demo"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-800"
              >
                {error}
              </div>
            )}

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Verificando acceso...' : 'Iniciar sesión en el taller'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleDemoAccess}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Acceso directo a la demo
              </button>
            </div>
          </form>

          <div className="mt-6 p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-medium text-slate-800">
                Acceso libre de prototipo (vale cualquier usuario y clave)
              </p>
              <p>
                Ejemplo preconfigurado: Usuario <span className="font-mono font-semibold text-slate-900">demo</span> · Contraseña{' '}
                <span className="font-mono font-semibold text-slate-900">1234</span>
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-between pt-4 border-t border-slate-200">
          <span>TALLER TRACK · Gestión operativa</span>
          <span>TEMIS ATRILE</span>
        </div>
      </div>
    </div>
  );
}
