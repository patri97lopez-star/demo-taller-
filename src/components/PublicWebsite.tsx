import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Phone,
  Shield,
  Wrench,
} from 'lucide-react';
import { api } from '../services/api';
import { PUBLIC_TIMELINE_STEPS } from '../types/domain';
import type { PublicWorkshopInfo } from '../types/domain';
import { ClientTrackerTool } from './ClientTrackerTool';

interface PublicWebsiteProps {
  initialQuery?: string;
  onNavigateAdmin: () => void;
}

export function PublicWebsite({ initialQuery = '', onNavigateAdmin }: PublicWebsiteProps) {
  const [workshop, setWorkshop] = useState<PublicWorkshopInfo | null>(null);
  const [toolTab, setToolTab] = useState<'cliente' | 'taller'>('cliente');

  // Image fallbacks
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [tabletImgFailed, setTabletImgFailed] = useState(false);
  const [mobileImgFailed, setMobileImgFailed] = useState(false);

  // Contact / demo request form
  const [contactTaller, setContactTaller] = useState('');
  const [contactNombre, setContactNombre] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTel, setContactTel] = useState('');
  const [contactNotas, setContactNotas] = useState('');
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    api
      .getPublicConfig()
      .then(setWorkshop)
      .catch(() => {
        // Fallback info handled gracefully
      });
  }, []);

  useEffect(() => {
    if (initialQuery.trim()) {
      setToolTab('cliente');
      const el = document.getElementById('herramienta');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [initialQuery]);

  function handleScrollToTool() {
    setToolTab('cliente');
    document.getElementById('herramienta')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactError(null);
    if (!contactTaller.trim() || !contactNombre.trim()) {
      setContactError('Indica el nombre del taller y una persona de contacto.');
      return;
    }
    if (!contactEmail.trim() && !contactTel.trim()) {
      setContactError('Introduce un correo electrónico o un teléfono para poder responderte.');
      return;
    }
    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setContactError('El formato del correo electrónico no es válido.');
      return;
    }
    setContactSent(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones */}
      <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#inicio"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
          >
            TALLER TRACK
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#herramienta"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Consultar coche
            </a>
            <a
              href="#beneficios"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Capacidades
            </a>
            <a
              href="#como-funciona"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Cómo funciona
            </a>
            <a
              href="#privacidad"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Seguridad
            </a>
            <a
              href="#contacto"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Contacto
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Acceso taller</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section id="inicio" className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              <div className="lg:col-span-7 flex flex-col justify-center">
                <p className="text-xs font-medium text-blue-600 mb-3">
                  Software de automatización para talleres mecánicos · TEMIS ATRILE
                </p>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-slate-900 leading-[1.1] text-balance font-display">
                  Menos llamadas preguntando por tu coche. Más tiempo para reparar.
                </h1>

                <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Digitaliza la recepción y el seguimiento de reparaciones de tu taller. Registra cada vehículo por matrícula, actualiza su fase en segundos y permite que tus clientes consulten su coche en tiempo real sin interrumpir el trabajo del equipo.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleScrollToTool}
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <span>Probar consulta en vivo</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateAdmin}
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Entrar al panel del taller</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  {!heroImgFailed ? (
                    <img
                      src="/src/assets/images/taller_mecanico_moderno_1794914054212.jpg"
                      alt="Interior moderno de taller mecánico con vehículo en elevador"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                      <Wrench className="w-12 h-12 text-slate-500" aria-hidden="true" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent text-white">
                    <p className="text-xs font-medium text-blue-300">
                      {workshop?.nombre_taller || 'Talleres Motor Norte'}
                    </p>
                    <p className="text-sm font-semibold mt-0.5">
                      Control operativo en elevador y portal de transparencia para el conductor
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-column quantitative operational strip below hero split */}
            <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">11 fases</p>
                <p className="text-xs text-slate-600 mt-1">
                  Estados técnicos predefinidos desde recepción hasta entrega
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">0 llamadas</p>
                <p className="text-xs text-slate-600 mt-1">
                  Para preguntar «¿ya está mi coche?» en horario de taller
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">100 % web</p>
                <p className="text-xs text-slate-600 mt-1">
                  Consulta inmediata desde móvil u ordenador sin instalar apps
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">RGPD</p>
                <p className="text-xs text-slate-600 mt-1">
                  Notas internas privadas aisladas del portal público del cliente
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. EMBEDDED LIVE TOOL SECTION */}
        <section id="herramienta" className="py-14 lg:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold text-blue-600 mb-1.5">
                  Herramienta interactiva conectada a base de datos
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display text-balance">
                  Prueba TALLER TRACK ahora mismo
                </h2>
              </div>

              {/* Workspace Environment Switcher inside the section toolbar */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/75 rounded-lg w-fit shrink-0">
                <button
                  type="button"
                  onClick={() => setToolTab('cliente')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    toolTab === 'cliente'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Portal del cliente
                </button>
                <button
                  type="button"
                  onClick={() => setToolTab('taller')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    toolTab === 'taller'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Panel del taller
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10">
              {toolTab === 'cliente' ? (
                <ClientTrackerTool
                  initialQuery={initialQuery}
                  onWorkshopLoaded={(info) => setWorkshop(info)}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <p className="text-xs font-semibold text-blue-600">
                      Entorno privado de gestión operativa
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 font-display">
                      Panel de Administración del Taller
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      Accede al dashboard privado para registrar entradas de vehículos, actualizar los 11 estados de reparación, añadir observaciones privadas y públicas, gestionar el historial de cada cliente y revisar los avisos automáticos generados.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="font-semibold text-slate-900">1. Registra o edita un vehículo</p>
                        <p className="text-slate-500 mt-0.5">
                          Cambia de «Pendiente de diagnóstico» a «En reparación» o «Listo para recoger».
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="font-semibold text-slate-900">2. Comprueba el portal al instante</p>
                        <p className="text-slate-500 mt-0.5">
                          Vuelve al Portal del cliente y verifica el cambio en tiempo real.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={onNavigateAdmin}
                        className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Lock className="w-4 h-4" aria-hidden="true" />
                        <span>Abrir panel de administración</span>
                      </button>
                      <span className="text-xs text-slate-500 font-mono">
                        Ejemplo: usuario demo · clave 1234 (acceso abierto en prototipo)
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-slate-900 text-slate-100 rounded-xl p-6 space-y-4">
                    <p className="text-xs font-medium text-blue-300">
                      Módulos incluidos en el panel
                    </p>
                    <ul className="space-y-2.5 text-sm">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>Dashboard con 6 indicadores y avisos de demora</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>Buscador por matrícula, cliente, estado y fecha</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>Centro de notificaciones automáticas por reglas</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>Historial de vehículos y reparaciones por cliente</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>Plantillas de mensajes y configuración del taller</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. ASYMMETRIC BENTO CAPABILITIES */}
        <section id="beneficios" className="py-14 lg:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-semibold text-blue-600 mb-2">
                Diseñado para la operativa real de taller
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 font-display text-balance">
                Automatización convencional basada en reglas claras, sin distracciones
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 01 (col-span-2) */}
              <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      01. Control de estados desde recepción hasta entrega
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      Cada vehículo dispone de una ficha única con su código de seguimiento, fecha estimada de entrega e historial cronológico. Al pulsar un estado, la base de datos registra la hora exacta y actualiza la vista del cliente.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                    <span>11 estados predefinidos</span>
                    <span aria-hidden="true">·</span>
                    <span>Alertas por permanencia prolongada</span>
                  </div>
                </div>
                <div className="h-56 md:h-auto bg-slate-200">
                  {!tabletImgFailed ? (
                    <img
                      src="/src/assets/images/taller_recepcion_tablet_1794914270497.jpg"
                      alt="Técnica de taller actualizando estado de reparación en tablet"
                      referrerPolicy="no-referrer"
                      onError={() => setTabletImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <Wrench className="w-8 h-8 text-slate-400" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </div>

              {/* Card 02 (col-span-1) */}
              <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <Bell className="w-6 h-6 text-blue-400 mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-bold font-display">
                    02. Avisos automáticos y prioridad en recogida
                  </h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    Cuando un coche pasa a «Esperando autorización», «Esperando piezas» o «Listo para recoger», el motor de reglas redacta el aviso automáticamente con los datos del vehículo.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
                  Arquitectura preparada para WhatsApp Business API, correo electrónico y SMS
                </div>
              </div>

              {/* Card 03 (col-span-1) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <Shield className="w-6 h-6 text-blue-600 mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    03. Notas internas separadas y cumplimiento RGPD
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    El mecánico anota referencias de recambios, incidencias o costes en el campo privado, mientras el cliente solo consulta observaciones públicas autorizadas y fechas de entrega.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
                  Cero exposición de teléfonos, correos u otros vehículos
                </div>
              </div>

              {/* Card 04 (col-span-2) */}
              <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="h-56 md:h-auto bg-slate-200 order-2 md:order-1">
                  {!mobileImgFailed ? (
                    <img
                      src="/src/assets/images/cliente_movil_coche_1794914270776.jpg"
                      alt="Propietario consultando el estado de su vehículo desde el teléfono móvil"
                      referrerPolicy="no-referrer"
                      onError={() => setMobileImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <Clock className="w-8 h-8 text-slate-400" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between order-1 md:order-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      04. Consulta móvil en segundos con matrícula o código
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      El conductor accede desde cualquier navegador con su matrícula o código <span className="font-mono text-slate-800">TT-2026-XXXX</span> y ve una línea temporal clara con fases completadas, fase actual resaltada y fecha estimada de entrega.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleScrollToTool}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>Probar búsqueda de matrícula ahora</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS + WORKSHOP INFO & PRIVACY */}
        <section id="como-funciona" className="py-14 lg:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                Las seis etapas visibles para el conductor
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Cada cambio interno del taller se traduce automáticamente en una línea de progreso comprensible para el cliente.
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {PUBLIC_TIMELINE_STEPS.map((step) => (
                  <div
                    key={step.stage}
                    className="p-4 rounded-xl border border-slate-200 bg-white"
                  >
                    <span className="text-xs font-mono font-semibold text-blue-600">
                      0{step.stage + 1}
                    </span>
                    <p className="mt-1.5 text-sm font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{step.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="privacidad" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
                <div className="flex items-center gap-2.5 text-slate-900 mb-4">
                  <Wrench className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  <h3 className="text-base font-semibold font-display">
                    {workshop?.nombre_taller || 'Talleres Motor Norte'}
                  </h3>
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

              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
                <div className="flex items-center gap-2.5 text-slate-900 mb-4">
                  <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  <h3 className="text-base font-semibold font-display">
                    Seguridad, privacidad y RGPD
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {workshop?.aviso_rgpd ||
                    'Los datos mostrados en este portal público están limitados estrictamente al estado técnico del vehículo conforme al RGPD. Ningún dato personal ni observación interna del taller es accesible públicamente.'}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  En entornos de producción, la consulta por matrícula se refuerza mediante código privado de reparación o enlace de acceso temporal enviado directamente al titular.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. WORKSHOP CONTACT / IMPLEMENTATION REQUEST */}
        <section id="contacto" className="py-14 lg:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-4">
                <p className="text-xs font-semibold text-blue-600">
                  Implantación para talleres · TEMIS ATRILE
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display text-balance">
                  ¿Quieres implantar TALLER TRACK en tu taller mecánico?
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Adaptamos la herramienta con el nombre, logotipo, horarios y mensajes automáticos de tu taller, conectada a tu base de datos y preparada para avisos por WhatsApp, SMS o correo electrónico.
                </p>
                <div className="pt-2 space-y-2 text-xs text-slate-600">
                  <p>· Puesta en marcha rápida sin cambiar tus herramientas de taller</p>
                  <p>· Formación breve para recepción y mecánicos</p>
                  <p>· Soporte técnico directo de TEMIS ATRILE</p>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8">
                {contactSent ? (
                  <div className="py-6 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" aria-hidden="true" />
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      Solicitud registrada correctamente
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Hemos registrado el interés de <strong>{contactTaller}</strong> ({contactNombre}). El equipo de TEMIS ATRILE revisará los detalles de tu taller para preparar una demostración personalizada.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setContactSent(false);
                        setContactTaller('');
                        setContactNombre('');
                        setContactEmail('');
                        setContactTel('');
                        setContactNotas('');
                      }}
                      className="mt-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                    >
                      Enviar otra consulta
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} noValidate className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="lead-taller"
                          className="block text-xs font-semibold text-slate-700 mb-1.5"
                        >
                          Nombre del taller *
                        </label>
                        <input
                          id="lead-taller"
                          type="text"
                          value={contactTaller}
                          onChange={(e) => setContactTaller(e.target.value)}
                          placeholder="Ej. Talleres Motor Norte"
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="lead-nombre"
                          className="block text-xs font-semibold text-slate-700 mb-1.5"
                        >
                          Persona de contacto *
                        </label>
                        <input
                          id="lead-nombre"
                          type="text"
                          value={contactNombre}
                          onChange={(e) => setContactNombre(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="lead-email"
                          className="block text-xs font-semibold text-slate-700 mb-1.5"
                        >
                          Correo electrónico
                        </label>
                        <input
                          id="lead-email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="contacto@tutaller.es"
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="lead-tel"
                          className="block text-xs font-semibold text-slate-700 mb-1.5"
                        >
                          Teléfono
                        </label>
                        <input
                          id="lead-tel"
                          type="tel"
                          value={contactTel}
                          onChange={(e) => setContactTel(e.target.value)}
                          placeholder="600 000 000"
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="lead-notas"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Comentarios o volumen mensual aproximado
                      </label>
                      <textarea
                        id="lead-notas"
                        rows={3}
                        value={contactNotas}
                        onChange={(e) => setContactNotas(e.target.value)}
                        placeholder="Ej. Taller multimarca con 4 elevadores y unos 120 vehículos al mes."
                        className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    {contactError && (
                      <div
                        role="alert"
                        className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-800"
                      >
                        {contactError}
                      </div>
                    )}

                    <div className="flex items-center justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Solicitar información
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-bold text-white text-sm font-display">TALLER TRACK</span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span>Menos llamadas preguntando por tu coche. Más tiempo para reparar.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href="#herramienta" className="hover:text-white transition-colors">
              Portal cliente
            </a>
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="hover:text-white transition-colors"
            >
              Acceso taller
            </button>
            <span className="text-slate-600">|</span>
            <span>
              Desarrollado por <strong className="text-white">TEMIS ATRILE</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
