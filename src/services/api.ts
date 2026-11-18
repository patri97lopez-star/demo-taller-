import type {
  ClientWithDetails,
  ConfiguracionTaller,
  DashboardSummary,
  Notificacion,
  NotificationChannel,
  PublicTrackingResult,
  PublicWorkshopInfo,
  RepairFullRecord,
  RepairStatus,
} from '../types/domain';
import { localDemoEngine } from './localDemoEngine';

const SESSION_KEY = 'taller_track_session_token';

export function getStoredSessionToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(SESSION_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}

async function requestWithFallback<T>(
  url: string,
  options: RequestInit,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  const token = getStoredSessionToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('x-workshop-session', token);
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // Static hosting (e.g. Vercel static Vite deployment without /api function) returns non-JSON 404/405
    if (!isJson && (res.status === 404 || res.status === 405 || res.status === 500)) {
      return await fallbackFn();
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Error en la comunicación con el servidor.');
      (err as Error & { status?: number }).status = res.status;
      throw err;
    }
    return data as T;
  } catch (err) {
    // Only fall back on network errors or missing static backend routes, not intentional API validation errors
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    return await fallbackFn();
  }
}

export const api = {
  // Public Client Portal
  getPublicConfig: () =>
    requestWithFallback<PublicWorkshopInfo>('/api/public/config', {}, () =>
      localDemoEngine.getPublicConfig()
    ),
  trackVehicle: (query: string) =>
    requestWithFallback<PublicTrackingResult>(
      `/api/public/track?q=${encodeURIComponent(query)}`,
      {},
      () => localDemoEngine.trackVehicle(query)
    ),

  // Authentication
  login: async (payload: { usuario?: string; password?: string; demoQuickAccess?: boolean }) => {
    const res = await requestWithFallback<{ token: string; usuario: string; rol: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => localDemoEngine.login(payload)
    );
    setStoredSessionToken(res.token);
    return res;
  },
  checkSession: () =>
    requestWithFallback<{ authenticated: boolean; usuario?: string; rol?: string }>(
      '/api/auth/session',
      {},
      () => localDemoEngine.checkSession(getStoredSessionToken())
    ),
  logout: async () => {
    try {
      await requestWithFallback<{ ok: boolean }>(
        '/api/auth/logout',
        { method: 'POST' },
        () => ({ ok: true })
      );
    } finally {
      setStoredSessionToken(null);
    }
  },

  // Admin Operations
  getDashboard: () =>
    requestWithFallback<DashboardSummary>('/api/admin/dashboard', {}, () =>
      localDemoEngine.getDashboard()
    ),
  getRepairs: () =>
    requestWithFallback<RepairFullRecord[]>('/api/admin/repairs', {}, () =>
      localDemoEngine.getRepairs()
    ),
  getRepairById: (id: string) =>
    requestWithFallback<RepairFullRecord>(`/api/admin/repairs/${id}`, {}, () => {
      const found = localDemoEngine.getRepairs().find((r) => r.reparacion.id === id);
      if (!found) throw new Error('Reparación no encontrada.');
      return found;
    }),
  registerVehicle: (payload: {
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
  }) =>
    requestWithFallback<RepairFullRecord>(
      '/api/admin/repairs',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => localDemoEngine.registerVehicle(payload)
    ),
  updateRepairStatus: (
    id: string,
    payload: {
      nuevo_estado: RepairStatus;
      observacion_publica?: string;
      observacion_privada?: string;
      fecha_estimada_entrega?: string;
      autor?: string;
      canal?: NotificationChannel;
      generar_notificacion?: boolean;
    }
  ) =>
    requestWithFallback<RepairFullRecord>(
      `/api/admin/repairs/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      () => localDemoEngine.updateRepairStatus(id, payload)
    ),
  updateRepairDetails: (
    id: string,
    payload: {
      matricula?: string;
      marca?: string;
      modelo?: string;
      nombre_cliente?: string;
      telefono_cliente?: string;
      email_cliente?: string;
      descripcion_averia?: string;
      fecha_estimada_entrega?: string;
      observaciones_publicas?: string;
      observaciones_privadas?: string;
    }
  ) =>
    requestWithFallback<RepairFullRecord>(
      `/api/admin/repairs/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      () => localDemoEngine.updateRepairDetails(id, payload)
    ),
  deliverVehicle: (id: string) =>
    requestWithFallback<RepairFullRecord>(
      `/api/admin/repairs/${id}/deliver`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
      () =>
        localDemoEngine.updateRepairStatus(id, {
          nuevo_estado: 'Vehículo entregado',
          observacion_publica: 'Vehículo entregado al propietario.',
          observacion_privada: 'Entrega registrada desde gestión de vehículos.',
          autor: 'Recepción Taller',
          generar_notificacion: true,
        })
    ),
  getClients: () =>
    requestWithFallback<ClientWithDetails[]>('/api/admin/clients', {}, () =>
      localDemoEngine.getClients()
    ),
  getNotifications: () =>
    requestWithFallback<Notificacion[]>('/api/admin/notifications', {}, () =>
      localDemoEngine.getNotifications()
    ),
  markNotificationRead: (id: string) =>
    requestWithFallback<Notificacion>(
      `/api/admin/notifications/${id}/read`,
      { method: 'POST' },
      () => localDemoEngine.markNotificationRead(id)
    ),
  markAllNotificationsRead: () =>
    requestWithFallback<{ ok: boolean }>(
      '/api/admin/notifications/read-all',
      { method: 'POST' },
      () => {
        localDemoEngine.markAllNotificationsRead();
        return { ok: true };
      }
    ),
  getWorkshopConfig: () =>
    requestWithFallback<ConfiguracionTaller>('/api/admin/config', {}, () =>
      localDemoEngine.getWorkshopConfig()
    ),
  updateWorkshopConfig: (payload: Partial<ConfiguracionTaller>) =>
    requestWithFallback<ConfiguracionTaller>(
      '/api/admin/config',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      () => localDemoEngine.updateWorkshopConfig(payload)
    ),
  resetDemo: () =>
    requestWithFallback<{ ok: boolean }>(
      '/api/admin/reset-demo',
      { method: 'POST' },
      () => {
        localDemoEngine.resetDemo();
        return { ok: true };
      }
    ),
};
