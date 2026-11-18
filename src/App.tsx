import { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import type { AdminSection } from './components/AdminLayout';
import { AdminLogin } from './components/AdminLogin';
import { ClientsView } from './components/ClientsView';
import { DashboardView } from './components/DashboardView';
import { NotificationsView } from './components/NotificationsView';
import { PublicTrackingPage } from './components/PublicTrackingPage';
import { PublicWebsite } from './components/PublicWebsite';
import { RegisterVehicleForm } from './components/RegisterVehicleForm';
import { RepairDetailView } from './components/RepairDetailView';
import { SettingsView } from './components/SettingsView';
import { VehiclesTableView } from './components/VehiclesTableView';
import { api, getStoredSessionToken, setStoredSessionToken } from './services/api';
import type {
  ClientWithDetails,
  ConfiguracionTaller,
  DashboardSummary,
  Notificacion,
  NotificationChannel,
  RepairFullRecord,
  RepairStatus,
} from './types/domain';

type AppRoute = 'website' | 'consulta' | 'admin';

function parseHashRoute(): { route: AppRoute; query: string } {
  const hash = window.location.hash || '';
  if (hash.startsWith('#/admin')) {
    return { route: 'admin', query: '' };
  }
  if (hash.startsWith('#/consulta') || hash.startsWith('#/portal')) {
    const qIdx = hash.indexOf('?q=');
    const query = qIdx >= 0 ? decodeURIComponent(hash.slice(qIdx + 3)) : '';
    return { route: 'consulta', query };
  }
  return { route: 'website', query: '' };
}

export default function App() {
  const initial = parseHashRoute();
  const [route, setRoute] = useState<AppRoute>(initial.route);
  const [portalQuery, setPortalQuery] = useState<string>(initial.query);

  // Auth state
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Raúl Gómez · Jefe de Taller');

  // Admin state
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [repairs, setRepairs] = useState<RepairFullRecord[]>([]);
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [workshopConfig, setWorkshopConfig] = useState<ConfiguracionTaller | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // Listen to browser back/forward hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHashRoute();
      setRoute(parsed.route);
      setPortalQuery(parsed.query);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadAllAdminData = useCallback(async () => {
    setLoadingAdmin(true);
    try {
      const [dash, repList, cliList, notifList, cfg] = await Promise.all([
        api.getDashboard(),
        api.getRepairs(),
        api.getClients(),
        api.getNotifications(),
        api.getWorkshopConfig(),
      ]);
      setDashboard(dash);
      setRepairs(repList);
      setClients(cliList);
      setNotifications(notifList);
      setWorkshopConfig(cfg);
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      if (status === 401) {
        setStoredSessionToken(null);
        setAuthenticated(false);
      }
    } finally {
      setLoadingAdmin(false);
    }
  }, []);

  // Verify existing session on mount
  useEffect(() => {
    const token = getStoredSessionToken();
    if (!token) {
      setSessionChecked(true);
      setAuthenticated(false);
      return;
    }
    api
      .checkSession()
      .then((res) => {
        if (res.authenticated) {
          setAuthenticated(true);
          if (res.usuario) setUserName(res.usuario);
        } else {
          setStoredSessionToken(null);
          setAuthenticated(false);
        }
      })
      .catch(() => {
        setStoredSessionToken(null);
        setAuthenticated(false);
      })
      .finally(() => setSessionChecked(true));
  }, []);

  // Load admin data when entering authenticated admin environment
  useEffect(() => {
    if (route === 'admin' && authenticated) {
      loadAllAdminData();
    }
  }, [route, authenticated, loadAllAdminData]);

  function navigateToWebsite() {
    setPortalQuery('');
    setRoute('website');
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateToConsulta(plate?: string) {
    setPortalQuery(plate ?? '');
    setRoute('consulta');
    window.location.hash = plate ? `#/consulta?q=${encodeURIComponent(plate)}` : '#/consulta';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateToAdmin() {
    setRoute('admin');
    window.location.hash = '#/admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLoginSuccess(session: { usuario: string; rol: string }) {
    setUserName(session.usuario);
    setAuthenticated(true);
    setActiveSection('dashboard');
    await loadAllAdminData();
  }

  async function handleLogout() {
    await api.logout();
    setAuthenticated(false);
    navigateToWebsite();
  }

  function handleOpenRepair(repairId: string) {
    setSelectedRepairId(repairId);
    setActiveSection('repair-detail');
  }

  async function handleRegisterVehicle(payload: Parameters<typeof api.registerVehicle>[0]) {
    const created = await api.registerVehicle(payload);
    await loadAllAdminData();
    setSelectedRepairId(created.reparacion.id);
    setActiveSection('repair-detail');
  }

  async function handleUpdateRepairStatus(
    repairId: string,
    payload: {
      nuevo_estado: RepairStatus;
      observacion_publica?: string;
      observacion_privada?: string;
      fecha_estimada_entrega?: string;
      canal?: NotificationChannel;
      generar_notificacion?: boolean;
    }
  ) {
    await api.updateRepairStatus(repairId, { ...payload, autor: userName });
    await loadAllAdminData();
  }

  async function handleUpdateRepairDetails(
    repairId: string,
    payload: Parameters<typeof api.updateRepairDetails>[1]
  ) {
    await api.updateRepairDetails(repairId, payload);
    await loadAllAdminData();
  }

  async function handleDeliverVehicle(repairId: string) {
    await api.deliverVehicle(repairId);
    await loadAllAdminData();
  }

  async function handleMarkNotificationRead(id: string) {
    await api.markNotificationRead(id);
    await loadAllAdminData();
  }

  async function handleMarkAllNotificationsRead() {
    await api.markAllNotificationsRead();
    await loadAllAdminData();
  }

  async function handleSaveConfig(payload: Partial<ConfiguracionTaller>) {
    const updated = await api.updateWorkshopConfig(payload);
    setWorkshopConfig(updated);
    await loadAllAdminData();
  }

  async function handleResetDemo() {
    await api.resetDemo();
    setSelectedRepairId(null);
    setActiveSection('dashboard');
    await loadAllAdminData();
  }

  if (route === 'website') {
    return (
      <PublicWebsite
        onOpenConsulta={() => navigateToConsulta()}
        onNavigateAdmin={navigateToAdmin}
      />
    );
  }

  if (route === 'consulta') {
    return (
      <PublicTrackingPage
        initialQuery={portalQuery}
        onBackToWebsite={navigateToWebsite}
        onNavigateAdmin={navigateToAdmin}
      />
    );
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-600">Cargando entorno del taller...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <AdminLogin
        onSuccess={handleLoginSuccess}
        onBackToPortal={navigateToWebsite}
      />
    );
  }

  const selectedRepair = repairs.find((r) => r.reparacion.id === selectedRepairId) ?? null;

  const breadcrumbMap: Record<AdminSection, string> = {
    dashboard: 'Dashboard',
    vehicles: 'Vehículos y reparaciones',
    register: 'Registrar entrada',
    clients: 'Clientes',
    notifications: 'Notificaciones',
    settings: 'Configuración',
    'repair-detail': selectedRepair
      ? `Ficha ${selectedRepair.vehiculo.matricula}`
      : 'Ficha de reparación',
  };

  const unreadCount = notifications.filter((n) => !n.leida).length;

  return (
    <AdminLayout
      activeSection={activeSection}
      workshopName={workshopConfig?.nombre_taller || 'Talleres Motor Norte'}
      userName={userName}
      unreadNotifications={unreadCount}
      breadcrumb={breadcrumbMap[activeSection]}
      onNavigate={(section) => setActiveSection(section)}
      onOpenPortal={() => navigateToConsulta()}
      onLogout={handleLogout}
    >
      {activeSection === 'dashboard' && (
        <DashboardView
          summary={dashboard}
          loading={loadingAdmin}
          onOpenRepair={handleOpenRepair}
          onNavigateVehicles={() => setActiveSection('vehicles')}
          onNavigateRegister={() => setActiveSection('register')}
        />
      )}

      {activeSection === 'vehicles' && (
        <VehiclesTableView
          repairs={repairs}
          loading={loadingAdmin}
          onOpenRepair={handleOpenRepair}
          onQuickStatusChange={(id, status) =>
            handleUpdateRepairStatus(id, { nuevo_estado: status, generar_notificacion: true })
          }
          onDeliverVehicle={handleDeliverVehicle}
          onNavigateRegister={() => setActiveSection('register')}
        />
      )}

      {activeSection === 'register' && (
        <RegisterVehicleForm
          existingClients={clients}
          onSubmit={handleRegisterVehicle}
          onCancel={() => setActiveSection('vehicles')}
        />
      )}

      {activeSection === 'repair-detail' && selectedRepair && (
        <RepairDetailView
          record={selectedRepair}
          onBack={() => setActiveSection('vehicles')}
          onUpdateStatus={handleUpdateRepairStatus}
          onUpdateDetails={handleUpdateRepairDetails}
          onDeliver={handleDeliverVehicle}
          onPreviewInPortal={(plate) => navigateToConsulta(plate)}
        />
      )}

      {activeSection === 'repair-detail' && !selectedRepair && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-base font-semibold text-slate-900">
            Selecciona un vehículo para ver su ficha
          </p>
          <button
            type="button"
            onClick={() => setActiveSection('vehicles')}
            className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg"
          >
            Ir al listado de vehículos
          </button>
        </div>
      )}

      {activeSection === 'clients' && (
        <ClientsView
          clients={clients}
          loading={loadingAdmin}
          onOpenRepair={handleOpenRepair}
        />
      )}

      {activeSection === 'notifications' && (
        <NotificationsView
          notifications={notifications}
          loading={loadingAdmin}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onOpenRepair={handleOpenRepair}
        />
      )}

      {activeSection === 'settings' && (
        <SettingsView
          config={workshopConfig}
          onSave={handleSaveConfig}
          onResetDemo={handleResetDemo}
        />
      )}
    </AdminLayout>
  );
}
