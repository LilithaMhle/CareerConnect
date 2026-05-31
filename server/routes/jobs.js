import express from 'express';
import { query, run, get } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/middleware.js';

const router = express.Router();

function parseJob(row) {
  if (!row) return null;
  return { ...row, tags: row.tags ? JSON.parse(row.tags) : [], requirements: row.requirements ? JSON.parse(row.requirements) : [], benefits: row.benefits ? JSON.parse(row.benefits) : [], featured: Boolean(row.featured) };
}

router.get('/', (req, res) => {
  const { q, type, experience, featured, limit = 50, offset = 0 } = req.query;
  let sql = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];
  if (q)          { sql += ' AND (title LIKE ? OR company LIKE ? OR description LIKE ? OR tags LIKE ?)'; const like = `%${q}%`; params.push(like,like,like,like); }
  if (type)       { sql += ' AND type = ?'; params.push(type); }
  if (experience) { sql += ' AND experience = ?'; params.push(experience); }
  if (featured)   { sql += ' AND featured = 1'; }
  sql += ' ORDER BY featured DESC, id DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  const jobs = query(sql, params).map(parseJob);
  const total = get('SELECT COUNT(*) as c FROM jobs').c;
  res.json({ jobs, total });
});

router.get('/featured', (req, res) => {
  const jobs = query('SELECT * FROM jobs WHERE featured = 1 ORDER BY id DESC LIMIT 6').map(parseJob);
  res.json({ jobs });
});

router.get('/:id', (req, res) => {
  const job = parseJob(get('SELECT * FROM jobs WHERE id = ?', [req.params.id]));
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ job });
});

router.post('/', authenticate, requireRole('employer'), (req, res) => {
  const { title, company, logo, location, type, salary, salary_min, salary_max, experience, tags, description, requirements, benefits, featured } = req.body;
  if (!title || !company) return res.status(400).json({ error: 'Title and company are required' });
  const { lastInsertRowid } = run(
    `INSERT INTO jobs (title,company,logo,location,type,salary,salary_min,salary_max,experience,tags,description,requirements,benefits,featured,posted_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [title, company, logo, location, type, salary, salary_min, salary_max, experience, JSON.stringify(tags||[]), description, JSON.stringify(requirements||[]), JSON.stringify(benefits||[]), featured?1:0, req.user.userId]
  );
  res.status(201).json({ job: parseJob(get('SELECT * FROM jobs WHERE id = ?', [lastInsertRowid])) });
});

router.put('/:id', authenticate, requireRole('employer'), (req, res) => {
  const existing = get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Job not found' });
  const { title, company, logo, location, type, salary, salary_min, salary_max, experience, tags, description, requirements, benefits, featured } = req.body;
  run(`UPDATE jobs SET title=?,company=?,logo=?,location=?,type=?,salary=?,salary_min=?,salary_max=?,experience=?,tags=?,description=?,requirements=?,benefits=?,featured=? WHERE id=?`,
    [title||existing.title, company||existing.company, logo||existing.logo, location||existing.location, type||existing.type, salary||existing.salary, salary_min||existing.salary_min, salary_max||existing.salary_max, experience||existing.experience, JSON.stringify(tags||JSON.parse(existing.tags||'[]')), description||existing.description, JSON.stringify(requirements||JSON.parse(existing.requirements||'[]')), JSON.stringify(benefits||JSON.parse(existing.benefits||'[]')), featured!==undefined?(featured?1:0):existing.featured, req.params.id]);
  res.json({ job: parseJob(get('SELECT * FROM jobs WHERE id = ?', [req.params.id])) });
});

router.delete('/:id', authenticate, requireRole('employer'), (req, res) => {
  const { changes } = run('DELETE FROM jobs WHERE id = ?', [req.params.id]);
  if (!changes) return res.status(404).json({ error: 'Job not found' });
  res.json({ message: 'Job deleted' });
});

export default router;
