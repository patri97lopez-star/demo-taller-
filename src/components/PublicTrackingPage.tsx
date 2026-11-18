import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Lock, MapPin, Phone, Shield, Wrench } from 'lucide-react';
import { api } from '../services/api';
import type { PublicWorkshopInfo } from '../types/domain';
import { ClientTrackerTool } from './ClientTrackerTool';

interface PublicTrackingPageProps {
  initialQuery?: string;
  onBackToWebsite: () => void;
  onNavigateAdmin: () => void;
}

export function PublicTrackingPage({
  initialQuery = '',
  onBackToWebsite,
  onNavigateAdmin,
}: PublicTrackingPageProps) {
  const [workshop, setWorkshop] = useState<PublicWorkshopInfo | null>(null);

  useEffect(() => {
    api
      .getPublicConfig()
      .then(setWorkshop)
      .catch(() => {
        // Fallback info handled gracefully
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={onBackToWebsite}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display hover:text-blue-600 transition-colors"
          >
            TALLER TRACK
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Volver a la web</span>
            </button>
            <a
              href="#contacto-taller"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Datos del taller
            </a>
            <a
              href="#privacidad-portal"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Privacidad
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Panel del taller</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Mobile back link */}
        <div className="md:hidden px-4 pt-4">
          <button
            type="button"
            onClick={onBackToWebsite}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Volver a la web principal</span>
          </button>
        </div>

        {/* Dedicated Consultation Tool Workspace */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10">
            <ClientTrackerTool
              initialQuery={initialQuery}
              onWorkshopLoaded={(info) => setWorkshop(info)}
            />
          </div>
        </section>

        {/* Workshop Info & Privacy */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="contacto-taller" className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2.5 text-slate-900 mb-4">
              <Wrench className="w-5 h-5 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-semibold font-display">
                {workshop?.nombre_taller || 'Talleres Motor Norte'}
              </h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{workshop?.direccion || 'Polígono Industrial Las Rozas, Madrid'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="font-mono tabular-nums">
                  {workshop?.telefono || '910 482 310'}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{workshop?.horario || 'Lunes a Viernes: 08:30 – 19:00'}</span>
              </div>
            </div>
          </div>

          <div id="privacidad-portal" className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2.5 text-slate-900 mb-4">
              <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-semibold font-display">
                Privacidad y seguridad (RGPD)
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {workshop?.aviso_rgpd ||
                'Los datos mostrados en este portal público están limitados estrictamente al estado técnico del vehículo conforme al RGPD. Ningún dato personal ni observación interna del taller es accesible públicamente.'}
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="font-medium text-slate-700">
            TALLER TRACK · Menos llamadas preguntando por tu coche. Más tiempo para reparar.
          </p>
          <p>
            Desarrollado por <span className="font-semibold text-slate-700">TEMIS ATRILE</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
