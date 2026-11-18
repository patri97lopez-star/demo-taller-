import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Phone,
  Search,
  Shield,
  Wrench,
} from 'lucide-react';
import { api } from '../services/api';
import { PUBLIC_TIMELINE_STEPS } from '../types/domain';
import type { PublicWorkshopInfo } from '../types/domain';

interface PublicWebsiteProps {
  onOpenConsulta: () => void;
  onNavigateAdmin: () => void;
}

export function PublicWebsite({ onOpenConsulta, onNavigateAdmin }: PublicWebsiteProps) {
  const [workshop, setWorkshop] = useState<PublicWorkshopInfo | null>(null);
  const [scrolled, setScrolled] = useState(false);

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
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      {/* Transparent-to-Obsidian Overlay Header */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ${
          scrolled
            ? 'bg-slate-950/95 backdrop-blur-md border-b border-white/10'
            : 'bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-6">
          {/* Zone 1: Wide-tracked Automotive Brand Wordmark */}
          <a
            href="#inicio"
            className="text-base sm:text-lg font-extrabold tracking-[0.22em] text-white whitespace-nowrap shrink-0 font-display"
          >
            TALLER TRACK
          </a>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/85">
            <a
              href="#capacidades"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Servicios
            </a>
            <a
              href="#fases"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Fases
            </a>
            <a
              href="#seguridad"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Garantía
            </a>
            <a
              href="#contacto"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Contacto
            </a>
          </nav>

          {/* Zone 3: Top-right two action buttons requested by user */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenConsulta}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">Consultar</span>
              <span className="hidden sm:inline">Probar consulta en vivo</span>
            </button>

            <button
              type="button"
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-xs rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">Panel</span>
              <span className="hidden sm:inline">Panel del taller</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 1. FULL-BLEED CINEMATIC AUTOMOTIVE HERO */}
        <section
          id="inicio"
          className="relative min-h-[82vh] sm:min-h-[88vh] bg-slate-950 flex flex-col justify-end overflow-hidden"
        >
          {/* Full-bleed Workshop Background */}
          {!heroImgFailed ? (
            <img
              src="/src/assets/images/taller_mecanico_moderno_1794913694188.jpg"
              alt="Bahía técnica moderna de taller mecánico con vehículo en elevador"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
              <Wrench className="w-16 h-16 text-slate-700" aria-hidden="true" />
            </div>
          )}

          {/* Measured atmospheric contrast scrims */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/35"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/35 to-transparent"
          />

          {/* Bottom-left Editorial Typography Anchor */}
          <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 sm:pb-16 lg:pb-20">
            <div className="max-w-3xl">
              <p className="text-xs sm:text-sm font-medium text-blue-300 tracking-wide mb-3">
                {workshop?.nombre_taller || 'Talleres Motor Norte'} · Seguimiento digital de reparaciones
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight text-white leading-[1.06] text-balance font-display">
                Menos llamadas preguntando por tu coche. Más tiempo para reparar.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                Consulta el estado real de cualquier vehículo introduciendo su matrícula o accede al panel interno del taller para actualizar cada fase en tiempo real.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={onOpenConsulta}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                >
                  <Search className="w-4 h-4" aria-hidden="true" />
                  <span>Probar consulta en vivo</span>
                </button>

                <button
                  type="button"
                  onClick={onNavigateAdmin}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-xs rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Lock className="w-4 h-4" aria-hidden="true" />
                  <span>Panel del taller</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sleek Dark Architectural Metrics Strip */}
        <section className="bg-slate-950 text-white border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="text-2xl font-bold font-mono tabular-nums text-white">3 fases</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Vehículo recibido, en reparación y listo para recoger visibles al instante
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono tabular-nums text-white">0 llamadas</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Innecesarias en recepción para consultar si el vehículo está listo
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono tabular-nums text-white">100 % web</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Portal accesible desde cualquier teléfono u ordenador sin instalar apps
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono tabular-nums text-white">RGPD</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Notas internas del taller aisladas de la vista pública del conductor
              </p>
            </div>
          </div>
        </section>

        {/* 2. ASYMMETRIC BENTO CAPABILITIES */}
        <section id="capacidades" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold text-blue-600 mb-2">
                Dos entornos independientes conectados en tiempo real
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display text-balance">
                Orden para el taller. Tranquilidad para el cliente.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 01 (col-span-2) */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="p-7 sm:p-9 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-display">
                      01. Actualización directa desde elevador o recepción
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      Registra cada coche en segundos, asigna fecha estimada de entrega y cambia de estado con un clic. El sistema registra automáticamente la fecha, hora e historial completo de la reparación.
                    </p>
                  </div>
                  <div className="mt-8 pt-5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onNavigateAdmin}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      <span>Abrir panel del taller</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="h-60 md:h-auto bg-slate-100">
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
              <div className="bg-slate-950 text-white rounded-2xl p-7 sm:p-9 flex flex-col justify-between">
                <div>
                  <Bell className="w-6 h-6 text-blue-400 mb-5" aria-hidden="true" />
                  <h3 className="text-xl font-bold font-display">
                    02. Avisos automáticos por reglas
                  </h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    Sin chatbots ni inteligencia artificial: cada transición genera automáticamente la notificación correspondiente, destacando como aviso prioritario cuando el coche pasa a «Listo para recoger».
                  </p>
                </div>
                <div className="mt-8 pt-5 border-t border-slate-800 text-xs text-slate-400">
                  Preparado para WhatsApp Business API, correo electrónico y SMS
                </div>
              </div>

              {/* Card 03 (col-span-1) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-7 sm:p-9 flex flex-col justify-between">
                <div>
                  <Shield className="w-6 h-6 text-blue-600 mb-5" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-slate-900 font-display">
                    03. Privacidad y control RGPD
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    Las observaciones internas de taller, costes o teléfonos permanecen privados. El portal público del cliente solo muestra el avance técnico autorizado y la fecha prevista de recogida.
                  </p>
                </div>
                <div className="mt-8 pt-5 border-t border-slate-100 text-xs text-slate-500">
                  Permisos separados entre administración y consulta pública
                </div>
              </div>

              {/* Card 04 (col-span-2) */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="h-60 md:h-auto bg-slate-100 order-2 md:order-1">
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
                <div className="p-7 sm:p-9 flex flex-col justify-between order-1 md:order-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-display">
                      04. Consulta móvil en un clic con matrícula o código
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      El cliente entra en la página de seguimiento, introduce su matrícula o código{' '}
                      <span className="font-mono text-slate-800">TT-2026-XXXX</span> y visualiza al instante su línea temporal de reparación y las notas del taller.
                    </p>
                  </div>
                  <div className="mt-8 pt-5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onOpenConsulta}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>Probar consulta en vivo</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CUSTOMER TIMELINE OVERVIEW + WORKSHOP DATA */}
        <section id="fases" className="py-16 lg:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-blue-600 mb-2">
                  Experiencia visual para el conductor
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                  Línea temporal clara en tres fases
                </h2>
                <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
                  El conductor visualiza en todo momento una ruta sencilla y directa desde que deja su vehículo hasta que pasa a recogerlo.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenConsulta}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Search className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ver consulta de cliente</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PUBLIC_TIMELINE_STEPS.map((step) => (
                <div
                  key={step.stage}
                  className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70"
                >
                  <span className="text-xs font-mono font-semibold text-blue-600">
                    0{step.stage + 1}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{step.subtitle}</p>
                </div>
              ))}
            </div>

            <div id="seguridad" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7">
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

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7">
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
                  En entornos de producción, la consulta por matrícula se refuerza con código privado o enlace temporal enviado por SMS, WhatsApp o correo electrónico al titular.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. WORKSHOP CONTACT / ONBOARDING */}
        <section id="contacto" className="py-16 lg:py-24 bg-slate-50">
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
                  Personalizamos la plataforma con el nombre, logotipo, horarios y plantillas de comunicación automática de tu taller, lista para conectar con tus clientes desde el primer día.
                </p>
                <div className="pt-2 space-y-2 text-xs text-slate-600">
                  <p>· Puesta en marcha rápida sin cambiar tus herramientas actuales</p>
                  <p>· Formación breve para recepción y mecánicos</p>
                  <p>· Soporte técnico directo de TEMIS ATRILE</p>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
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
                      className="mt-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100"
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
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-bold tracking-[0.18em] text-white text-sm font-display">
              TALLER TRACK
            </span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span>Menos llamadas preguntando por tu coche. Más tiempo para reparar.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <button
              type="button"
              onClick={onOpenConsulta}
              className="hover:text-white transition-colors"
            >
              Probar consulta en vivo
            </button>
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="hover:text-white transition-colors"
            >
              Panel del taller
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
