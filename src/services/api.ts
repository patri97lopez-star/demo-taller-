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

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredSessionToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('x-workshop-session', token);
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Error en la comunicación con el servidor.');
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return data as T;
}

export const api = {
  // Public Client Portal
  getPublicConfig: () => request<PublicWorkshopInfo>('/api/public/config'),
  trackVehicle: (query: string) =>
    request<PublicTrackingResult>(`/api/public/track?q=${encodeURIComponent(query)}`),

  // Authentication
  login: async (payload: { usuario?: string; password?: string; demoQuickAccess?: boolean }) => {
    const res = await request<{ token: string; usuario: string; rol: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    setStoredSessionToken(res.token);
    return res;
  },
  checkSession: () =>
    request<{ authenticated: boolean; usuario?: string; rol?: string }>('/api/auth/session'),
  logout: async () => {
    try {
      await request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredSessionToken(null);
    }
  },

  // Admin Operations
  getDashboard: () => request<DashboardSummary>('/api/admin/dashboard'),
  getRepairs: () => request<RepairFullRecord[]>('/api/admin/repairs'),
  getRepairById: (id: string) => request<RepairFullRecord>(`/api/admin/repairs/${id}`),
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
    request<RepairFullRecord>('/api/admin/repairs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
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
    request<RepairFullRecord>(`/api/admin/repairs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
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
    request<RepairFullRecord>(`/api/admin/repairs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deliverVehicle: (id: string) =>
    request<RepairFullRecord>(`/api/admin/repairs/${id}/deliver`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  getClients: () => request<ClientWithDetails[]>('/api/admin/clients'),
  getNotifications: () => request<Notificacion[]>('/api/admin/notifications'),
  markNotificationRead: (id: string) =>
    request<Notificacion>(`/api/admin/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () =>
    request<{ ok: boolean }>('/api/admin/notifications/read-all', { method: 'POST' }),
  getWorkshopConfig: () => request<ConfiguracionTaller>('/api/admin/config'),
  updateWorkshopConfig: (payload: Partial<ConfiguracionTaller>) =>
    request<ConfiguracionTaller>('/api/admin/config', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  resetDemo: () => request<{ ok: boolean }>('/api/admin/reset-demo', { method: 'POST' }),
};
