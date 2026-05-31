/**
 * Shared middleware:
 * - requestLogger: logs every request
 * - authenticate:  verifies JWT, attaches req.user
 * - requireRole:   guards routes by user role
 * - validateBody:  checks required fields
 * - errorHandler:  catches and formats errors
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'careerconnect-dev-secret-change-in-production';

// ─── Request logger ───────────────────────────────────────────────────────────
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${color}${req.method} ${req.path} ${res.statusCode} - ${ms}ms\x1b[0m`);
  });
  next();
}

// ─── JWT authentication ───────────────────────────────────────────────────────
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Please log in again.' });
  }
}

// ─── Role guard ───────────────────────────────────────────────────────────────
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({
        error: `This action requires the "${role}" role. Your account role is "${req.user.role}".`
      });
    }
    next();
  };
}

// ─── Input sanitisation helper ────────────────────────────────────────────────
export function sanitise(value) {
  if (typeof value !== 'string') return value;
  // Strip common XSS patterns
  return value
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

// ─── Global error handler ─────────────────────────────────────────────────────
export function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err);

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Duplicate entry — this record already exists.' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred. Please try again.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
