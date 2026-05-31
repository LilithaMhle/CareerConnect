import express from 'express';
import { query, run, get } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/middleware.js';

const router = express.Router();
const STATUS_ORDER = ['unopened','opened','review','shortlisted','interview','accepted','rejected'];

function parseApp(row) {
  if (!row) return null;
  return { ...row, status_history: row.status_history ? JSON.parse(row.status_history) : [] };
}

// Seeker saves — must be before /:id routes
router.get('/saved', authenticate, requireRole('seeker'), (req, res) => {
  const saved = query(`SELECT j.*, s.saved_at FROM saved_jobs s JOIN jobs j ON s.job_id=j.id WHERE s.user_id=? ORDER BY s.saved_at DESC`, [req.user.userId])
    .map(row => ({ ...row, tags: row.tags ? JSON.parse(row.tags) : [], requirements: row.requirements ? JSON.parse(row.requirements) : [], benefits: row.benefits ? JSON.parse(row.benefits) : [] }));
  res.json({ saved });
});

router.post('/saved', authenticate, requireRole('seeker'), (req, res) => {
  const { job_id } = req.body;
  if (!job_id) return res.status(400).json({ error: 'job_id required' });
  const existing = get('SELECT id FROM saved_jobs WHERE user_id=? AND job_id=?', [req.user.userId, job_id]);
  if (existing) {
    run('DELETE FROM saved_jobs WHERE user_id=? AND job_id=?', [req.user.userId, job_id]);
    return res.json({ saved: false, message: 'Job removed from saved' });
  }
  run('INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)', [req.user.userId, job_id]);
  res.json({ saved: true, message: 'Job saved' });
});

// Apply to job
router.post('/', authenticate, requireRole('seeker'), (req, res) => {
  const { job_id } = req.body;
  if (!job_id) return res.status(400).json({ error: 'job_id is required' });
  const job = get('SELECT * FROM jobs WHERE id = ?', [job_id]);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const existing = get('SELECT id FROM applications WHERE job_id=? AND user_id=?', [job_id, req.user.userId]);
  if (existing) return res.status(409).json({ error: 'Already applied to this job' });

  const now = new Date();
  const ts = now.toISOString().replace('T',' ').slice(0,16);
  const { lastInsertRowid } = run(`INSERT INTO applications (job_id,user_id,status,status_history) VALUES (?,?,'unopened',?)`,
    [job_id, req.user.userId, JSON.stringify([{status:'submitted',timestamp:ts,note:'Application submitted.'}])]);

  const app = parseApp(get(`SELECT a.*,j.title as job_title,j.company,j.logo FROM applications a JOIN jobs j ON a.job_id=j.id WHERE a.id=?`, [lastInsertRowid]));
  res.status(201).json({ application: app });
});

// Seeker's own applications
router.get('/mine', authenticate, requireRole('seeker'), (req, res) => {
  const apps = query(`SELECT a.*,j.title as job_title,j.company,j.logo,j.type,j.location FROM applications a JOIN jobs j ON a.job_id=j.id WHERE a.user_id=? ORDER BY a.applied_at DESC`, [req.user.userId]).map(parseApp);
  res.json({ applications: apps });
});

// Employer sees all
router.get('/', authenticate, requireRole('employer'), (req, res) => {
  const apps = query(`SELECT a.*,j.title as job_title,j.company,j.logo,u.email as candidate_email,u.name as candidate_name FROM applications a JOIN jobs j ON a.job_id=j.id JOIN users u ON a.user_id=u.id ORDER BY a.updated_at DESC`).map(parseApp);
  res.json({ applications: apps });
});

// Employer updates status
router.patch('/:id/status', authenticate, requireRole('employer'), (req, res) => {
  const { status, note } = req.body;
  if (!STATUS_ORDER.includes(status)) return res.status(400).json({ error: `Invalid status. Must be one of: ${STATUS_ORDER.join(', ')}` });
  const app = get('SELECT * FROM applications WHERE id=?', [req.params.id]);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  const now = new Date();
  const ts = now.toISOString().replace('T',' ').slice(0,16);
  const history = JSON.parse(app.status_history||'[]');
  history.push({status, timestamp:ts, note: note||`Status updated to ${status}.`});

  run(`UPDATE applications SET status=?,employer_note=?,status_history=?,updated_at=datetime('now') WHERE id=?`,
    [status, note||app.employer_note, JSON.stringify(history), req.params.id]);

  const updated = parseApp(get(`SELECT a.*,j.title as job_title,j.company,j.logo,u.email as candidate_email,u.name as candidate_name FROM applications a JOIN jobs j ON a.job_id=j.id JOIN users u ON a.user_id=u.id WHERE a.id=?`, [req.params.id]));
  res.json({ application: updated });
});

// Seeker withdraws
router.delete('/:id', authenticate, requireRole('seeker'), (req, res) => {
  const app = get('SELECT * FROM applications WHERE id=? AND user_id=?', [req.params.id, req.user.userId]);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  run('DELETE FROM applications WHERE id=?', [req.params.id]);
  res.json({ message: 'Application withdrawn' });
});

export default router;
