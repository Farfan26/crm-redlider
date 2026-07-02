/**
 * Sistema Comercial Red Líder - Servidor Backend Express & Vite SPA
 * Puerto 3000 (Host 0.0.0.0) obligatorio para entorno en nube
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Importar routers
import { leadsRouter } from './src/server/routes/leads.js';
import { metaRouter } from './src/server/routes/meta.js';
import { analyticsRouter } from './src/server/routes/analytics.js';
import { eventsRouter } from './src/server/routes/events.js';
import { referralsRouter } from './src/server/routes/referrals.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para JSON y urlencoded (obligatorio para webhooks de Meta)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes (SIEMPRE ANTES DE VITE)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Sistema Comercial Red Líder API',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/leads', leadsRouter);
  app.use('/api/meta', metaRouter);
  app.use('/api/webhook', metaRouter); // Meta Webhook en /api/webhook/meta y /api/webhook
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/referrals', referralsRouter);

  // Configuración Vite Middleware para desarrollo o estáticos en producción
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor Comercial Red Líder ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Error crítico iniciando servidor:', err);
});
