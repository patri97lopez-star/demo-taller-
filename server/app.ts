import express from 'express';
import crypto from 'node:crypto';
import {
  findPublicTracking,
  getAllRepairs,
  getClientsWithDetails,
  getDashboardSummary,
  getNotifications,
  getPublicWorkshopInfo,
  getRepairById,
  getWorkshopConfig,
  markAllNotificationsRead,
  markNotificationRead,
  registerVehicleEntry,
  resetDemoDatabase,
  updateRepairDetails,
  updateRepairStatus,
  updateWorkshopConfig,
} from './db.ts';
import { REPAIR_STATES } from '../src/types/domain.ts';
import type { RepairStatus } from '../src/types/domain.ts';

export const app = express();
app.use(express.json({ limit: '2mb' }));

const SESSION_SECRET = process.env.SESSION_SECRET || 'taller-track-prototype-hmac-key';

interface SessionPayload {
  usuario: string;
  rol: string;
  createdAt: number;
}

function signSessionToken(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as SessionPayload;
  } catch {
    return null;
  }
}

function requireWorkshopAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const session = verifySessionToken(req.header('x-workshop-session'));
  if (!session) {
    res.status(401).json({
      error: 'Sesión de taller no iniciada o caducada. Inicia sesión para acceder al panel.',
    });
    return;
  }
  next();
}

app.get('/api/public/config', (_req, res) => {
  res.json(getPublicWorkshopInfo());
});

app.get('/api/public/track', (req, res) => {
  const query = String(req.query.q ?? '');
  if (!query.trim()) {
    res.status(400).json({ error: 'Introduce una matrícula o código de seguimiento.' });
    return;
  }
  const result = findPublicTracking(query);
  if (!result) {
    res.status(404).json({
      error:
        'No hemos encontrado ningún vehículo asociado a esta matrícula. Comprueba los datos o contacta con tu taller.',
    });
    return;
  }
  res.json(result);
});

app.post('/api/auth/login', (req, res) => {
  const { usuario, password, demoQuickAccess } = req.body ?? {};
  const cleanUser = String(usuario ?? '').trim();
  const cleanPass = String(password ?? '');
  const validPrototypeAccess =
    demoQuickAccess === true || (cleanUser.length > 0 && cleanPass.length > 0);

  if (!validPrototypeAccess) {
    res.status(400).json({
      error: 'Introduce cualquier usuario y contraseña de prueba (por ejemplo: demo / 1234).',
    });
    return;
  }

  const displayUser =
    demoQuickAccess === true ||
    cleanUser.toLowerCase() === 'demo' ||
    cleanUser.toLowerCase() === 'admin@tallertrack.es'
      ? 'Raúl Gómez · Jefe de Taller'
      : cleanUser;

  const session: SessionPayload = {
    usuario: displayUser,
    rol: 'Administrador de Taller',
    createdAt: Date.now(),
  };
  const token = signSessionToken(session);
  res.json({ token, ...session });
});

app.get('/api/auth/session', (req, res) => {
  const session = verifySessionToken(req.header('x-workshop-session'));
  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, ...session });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/admin/dashboard', requireWorkshopAuth, (_req, res) => {
  res.json(getDashboardSummary());
});

app.get('/api/admin/repairs', requireWorkshopAuth, (_req, res) => {
  res.json(getAllRepairs());
});

app.get('/api/admin/repairs/:id', requireWorkshopAuth, (req, res) => {
  const repair = getRepairById(String(req.params.id));
  if (!repair) {
    res.status(404).json({ error: 'Reparación no encontrada.' });
    return;
  }
  res.json(repair);
});

app.post('/api/admin/repairs', requireWorkshopAuth, (req, res) => {
  const body = req.body ?? {};
  const requiredFields = [
    ['matricula', 'La matrícula es obligatoria.'],
    ['marca', 'La marca del vehículo es obligatoria.'],
    ['modelo', 'El modelo del vehículo es obligatorio.'],
    ['nombre_cliente', 'El nombre del cliente es obligatorio.'],
    ['telefono_cliente', 'El teléfono del cliente es obligatorio.'],
    ['fecha_entrada', 'La fecha y hora de entrada son obligatorias.'],
    ['descripcion_averia', 'La descripción del problema o avería es obligatoria.'],
    ['observaciones_privadas', 'Las observaciones internas son obligatorias.'],
  ] as const;

  for (const [field, message] of requiredFields) {
    if (!String(body[field] ?? '').trim()) {
      res.status(400).json({ error: message });
      return;
    }
  }

  try {
    const created = registerVehicleEntry({
      matricula: String(body.matricula),
      marca: String(body.marca),
      modelo: String(body.modelo),
      nombre_cliente: String(body.nombre_cliente),
      telefono_cliente: String(body.telefono_cliente),
      email_cliente: body.email_cliente ? String(body.email_cliente) : '',
      fecha_entrada: String(body.fecha_entrada),
      fecha_estimada_entrega: body.fecha_estimada_entrega
        ? String(body.fecha_estimada_entrega)
        : '',
      descripcion_averia: String(body.descripcion_averia),
      observaciones_privadas: String(body.observaciones_privadas),
      observaciones_publicas: body.observaciones_publicas
        ? String(body.observaciones_publicas)
        : undefined,
      estado_inicial: REPAIR_STATES.includes(body.estado_inicial)
        ? (body.estado_inicial as RepairStatus)
        : 'Pendiente de diagnóstico',
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Error al registrar el vehículo.',
    });
  }
});

app.patch('/api/admin/repairs/:id/status', requireWorkshopAuth, (req, res) => {
  const body = req.body ?? {};
  if (!REPAIR_STATES.includes(body.nuevo_estado)) {
    res.status(400).json({ error: 'Estado de reparación no válido.' });
    return;
  }
  const updated = updateRepairStatus(String(req.params.id), {
    nuevo_estado: body.nuevo_estado as RepairStatus,
    observacion_publica:
      body.observacion_publica !== undefined ? String(body.observacion_publica) : undefined,
    observacion_privada:
      body.observacion_privada !== undefined ? String(body.observacion_privada) : undefined,
    fecha_estimada_entrega:
      body.fecha_estimada_entrega !== undefined
        ? String(body.fecha_estimada_entrega)
        : undefined,
    autor: body.autor ? String(body.autor) : undefined,
    canal: body.canal,
    generar_notificacion: body.generar_notificacion !== false,
  });

  if (!updated) {
    res.status(404).json({ error: 'Reparación no encontrada.' });
    return;
  }
  res.json(updated);
});

app.patch('/api/admin/repairs/:id', requireWorkshopAuth, (req, res) => {
  const updated = updateRepairDetails(String(req.params.id), req.body ?? {});
  if (!updated) {
    res.status(404).json({ error: 'Reparación no encontrada.' });
    return;
  }
  res.json(updated);
});

app.post('/api/admin/repairs/:id/deliver', requireWorkshopAuth, (req, res) => {
  const updated = updateRepairStatus(String(req.params.id), {
    nuevo_estado: 'Vehículo entregado',
    observacion_publica:
      req.body?.observacion_publica || 'Vehículo entregado al propietario.',
    observacion_privada:
      req.body?.observacion_privada || 'Entrega registrada desde gestión de vehículos.',
    autor: 'Recepción Taller',
    generar_notificacion: true,
  });
  if (!updated) {
    res.status(404).json({ error: 'Reparación no encontrada.' });
    return;
  }
  res.json(updated);
});

app.get('/api/admin/clients', requireWorkshopAuth, (_req, res) => {
  res.json(getClientsWithDetails());
});

app.get('/api/admin/notifications', requireWorkshopAuth, (_req, res) => {
  res.json(getNotifications());
});

app.post('/api/admin/notifications/:id/read', requireWorkshopAuth, (req, res) => {
  const updated = markNotificationRead(String(req.params.id));
  if (!updated) {
    res.status(404).json({ error: 'Notificación no encontrada.' });
    return;
  }
  res.json(updated);
});

app.post('/api/admin/notifications/read-all', requireWorkshopAuth, (_req, res) => {
  markAllNotificationsRead();
  res.json({ ok: true });
});

app.get('/api/admin/config', requireWorkshopAuth, (_req, res) => {
  res.json(getWorkshopConfig());
});

app.put('/api/admin/config', requireWorkshopAuth, (req, res) => {
  const updated = updateWorkshopConfig(req.body ?? {});
  res.json(updated);
});

app.post('/api/admin/reset-demo', requireWorkshopAuth, (_req, res) => {
  resetDemoDatabase();
  res.json({ ok: true });
});
