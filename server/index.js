/**
 * CareerConnect AI - Express Server
 * Serves the REST API and the built React frontend on the SAME port.
 * In development: frontend runs on Vite (port 3000) and proxies /api → here (port 3001).
 * In production: Express serves the Vite build from ../client/dist.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/database.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import nlpRoutes from './routes/nlp.js';
import analyticsRoutes from './routes/analytics.js';
import { requestLogger, errorHandler } from './middleware/middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/jobs',         jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/nlp',          nlpRoutes);
app.use('/api/analytics',    analyticsRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── Serve React frontend (production build) ──────────────────────────────────
// The Vite build outputs to client/dist. Express serves those static files,
// and for ANY non-API route it returns index.html so React Router works.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      // If dist doesn't exist yet, show a helpful message
      res.status(200).send(`
        <html><body style="font-family:sans-serif;padding:40px;background:#07041a;color:#2DD4A4">
          <h2>🚀 CareerConnect API is running!</h2>
          <p style="color:white">To see the full app, run: <code style="background:#1a1040;padding:4px 8px;border-radius:4px">npm run build</code> inside the <strong>client</strong> folder, then restart this server.</p>
          <p style="color:#7C6FE0">Or run <code style="background:#1a1040;padding:4px 8px;border-radius:4px">npm run dev</code> in the client folder for the Vite dev server (port 3000).</p>
          <hr style="border-color:#2DD4A4;margin:20px 0">
          <p style="color:white">API health: <a href="/api/health" style="color:#2DD4A4">/api/health</a></p>
        </body></html>
      `);
    }
  });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 CareerConnect server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend (if built) served at http://localhost:${PORT}`);
    console.log(`\n💡 For development with hot-reload:`);
    console.log(`   Terminal 1: cd server && npm run dev   (API on :${PORT})`);
    console.log(`   Terminal 2: cd client && npm run dev   (UI  on :3000)\n`);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
