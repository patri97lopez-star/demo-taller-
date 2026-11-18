import React, { useState } from 'react';
import {
  Bell,
  Car,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Users,
  X,
} from 'lucide-react';

export type AdminSection =
  | 'dashboard'
  | 'vehicles'
  | 'register'
  | 'clients'
  | 'notifications'
  | 'settings'
  | 'repair-detail';

interface AdminLayoutProps {
  activeSection: AdminSection;
  workshopName: string;
  userName: string;
  unreadNotifications: number;
  breadcrumb: string;
  onNavigate: (section: AdminSection) => void;
  onOpenPortal: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AdminLayout({
  activeSection,
  workshopName,
  userName,
  unreadNotifications,
  breadcrumb,
  onNavigate,
  onOpenPortal,
  onLogout,
  children,
}: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const navItems: Array<{
    id: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Vehículos y reparaciones', icon: Car },
    { id: 'register', label: 'Registrar entrada', icon: Plus },
    { id: 'clients', label: 'Clientes', icon: Users },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  function handleSelect(section: AdminSection) {
    onNavigate(section);
    setMobileOpen(false);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      <div className="px-5 h-16 flex items-center justify-between border-b border-slate-800">
        <div>
          <p className="text-base font-bold tracking-tight text-white font-display">
            TALLER TRACK
          </p>
          <p className="text-xs text-slate-400 truncate max-w-[190px]">{workshopName}</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Menú principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeSection === item.id ||
            (activeSection === 'repair-detail' && item.id === 'vehicles');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </span>
              {item.badge !== undefined && (
                <span
                  className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-blue-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          type="button"
          onClick={onOpenPortal}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span>Abrir portal del cliente</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 px-2 py-2">
          {!avatarFailed ? (
            <img
              src="/src/assets/images/avatar_jefe_taller_1794914055670.jpg"
              alt={userName}
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
              RG
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[11px] text-slate-400 truncate">TEMIS ATRILE</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">{sidebarContent}</div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Abrir navegación"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-slate-500 truncate flex items-center gap-2">
              <span className="hidden sm:inline">{workshopName}</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="font-semibold text-slate-900 truncate">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenPortal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Portal cliente</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Registrar vehículo</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>

        <footer className="px-6 py-4 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TALLER TRACK · Menos llamadas preguntando por tu coche. Más tiempo para reparar.</span>
          <span>Desarrollado por TEMIS ATRILE</span>
        </footer>
      </div>
    </div>
  );
}
