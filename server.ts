import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
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
} from './server/db.ts';
import { REPAIR_STATES } from './src/types/domain.ts';
import type { RepairStatus } from './src/types/domain.ts';

const PORT = 3000;
const app = express();
app.use(express.json({ limit: '2mb' }));

const activeSessions = new Map<string, { usuario: string; rol: string; createdAt: number }>();

function requireWorkshopAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const token = req.header('x-workshop-session');
  if (!token || !activeSessions.has(token)) {
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
  const validDemo =
    demoQuickAccess === true ||
    (String(usuario ?? '').trim().toLowerCase() === 'admin@tallertrack.es' &&
      String(password ?? '') === 'taller2026');

  if (!validDemo) {
    res.status(401).json({
      error: 'Credenciales incorrectas. Usa el acceso de demostración o las credenciales del taller.',
    });
    return;
  }

  const token = `tt_sess_${crypto.randomUUID()}`;
  const session = {
    usuario: 'Raúl Gómez · Jefe de Taller',
    rol: 'Administrador de Taller',
    createdAt: Date.now(),
  };
  activeSessions.set(token, session);
  res.json({ token, ...session });
});

app.get('/api/auth/session', (req, res) => {
  const token = req.header('x-workshop-session');
  if (!token || !activeSessions.has(token)) {
    res.status(401).json({ authenticated: false });
    return;
  }
  const session = activeSessions.get(token)!;
  res.json({ authenticated: true, ...session });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.header('x-workshop-session');
  if (token) {
    activeSessions.delete(token);
  }
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

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist'));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TALLER TRACK server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
