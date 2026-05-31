/**
 * SQLite database using sql.js (pure JavaScript — no native bindings needed).
 * All data is stored in memory and optionally persisted to a file.
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'careerconnect.sqlite');

let db;
let SQL;

// Persist DB to disk every 30 seconds and on process exit
function persistDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function getDb() { return db; }

export async function initDb() {
  SQL = await initSqlJs();

  // Load existing DB from disk if it exists
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Loaded existing database from', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ Created new in-memory database');
  }

  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    email     TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    role      TEXT NOT NULL DEFAULT 'seeker',
    name      TEXT,
    bio       TEXT,
    skills    TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    company     TEXT NOT NULL,
    logo        TEXT,
    location    TEXT,
    type        TEXT,
    salary      TEXT,
    salary_min  INTEGER,
    salary_max  INTEGER,
    experience  TEXT,
    tags        TEXT,
    description TEXT,
    requirements TEXT,
    benefits    TEXT,
    featured    INTEGER DEFAULT 0,
    posted_by   INTEGER,
    created_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id          INTEGER NOT NULL,
    user_id         INTEGER NOT NULL,
    status          TEXT NOT NULL DEFAULT 'unopened',
    employer_note   TEXT,
    status_history  TEXT,
    applied_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now')),
    UNIQUE(job_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS saved_jobs (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_id  INTEGER NOT NULL,
    saved_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, job_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS resume_analyses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    resume_text TEXT,
    analysis    TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  )`);

  // Seed jobs if empty
  const [countResult] = db.exec('SELECT COUNT(*) as c FROM jobs');
  const count = countResult ? countResult.values[0][0] : 0;
  if (count === 0) {
    seedJobs();
    persistDb();
  }

  // Auto-persist periodically
  setInterval(persistDb, 30000);
  process.on('exit', persistDb);
  process.on('SIGINT', () => { persistDb(); process.exit(0); });
  process.on('SIGTERM', () => { persistDb(); process.exit(0); });

  console.log('✅ Database ready');
  return db;
}

// ─── sql.js helper: convert exec result to array of objects ──────────────────
export function sqlRows(results) {
  if (!results || results.length === 0) return [];
  const { columns, values } = results[0];
  return values.map(row => Object.fromEntries(columns.map((col, i) => [col, row[i]])));
}

// ─── sql.js helper: run a query and return rows ───────────────────────────────
export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// ─── sql.js helper: run INSERT/UPDATE/DELETE and return lastInsertRowid ───────
export function run(sql, params = []) {
  db.run(sql, params);
  const [idResult] = db.exec('SELECT last_insert_rowid() as id');
  const lastId = idResult ? idResult.values[0][0] : null;
  // Count changes
  const [changesResult] = db.exec('SELECT changes() as c');
  const changes = changesResult ? changesResult.values[0][0] : 0;
  persistDb(); // persist after every write
  return { lastInsertRowid: lastId, changes };
}

// ─── sql.js helper: get single row ────────────────────────────────────────────
export function get(sql, params = []) {
  const rows = query(sql, params);
  return rows[0] || null;
}

function seedJobs() {
  const JOBS = [
    { title: 'Senior Frontend Developer', company: 'Stripe', logo: '💳', location: 'Remote', type: 'Full-time', salary: '$120k – $160k', salary_min: 120000, salary_max: 160000, experience: 'Senior', tags: JSON.stringify(['React', 'TypeScript', 'GraphQL', 'Tailwind']), description: 'We are looking for a Senior Frontend Developer to join our product team at Stripe. You will work on developer-facing dashboards and payment UIs used by millions.', requirements: JSON.stringify(['5+ years React', 'TypeScript proficiency', 'API integration experience']), benefits: JSON.stringify(['Remote-first', 'Equity', 'Health insurance']), featured: 1 },
    { title: 'Full Stack Engineer', company: 'Vercel', logo: '▲', location: 'San Francisco, CA', type: 'Full-time', salary: '$130k – $170k', salary_min: 130000, salary_max: 170000, experience: 'Mid-level', tags: JSON.stringify(['Next.js', 'Node.js', 'PostgreSQL', 'AWS']), description: 'Join Vercel as a Full Stack Engineer building the infrastructure that powers the modern web.', requirements: JSON.stringify(['Node.js', 'Next.js', 'Database design']), benefits: JSON.stringify(['Hybrid work', 'Equity', 'Generous PTO']), featured: 1 },
    { title: 'React Developer', company: 'Notion', logo: '📓', location: 'New York, NY', type: 'Full-time', salary: '$100k – $140k', salary_min: 100000, salary_max: 140000, experience: 'Mid-level', tags: JSON.stringify(['React', 'JavaScript', 'CSS', 'REST APIs']), description: 'Help build the future of collaborative productivity at Notion.', requirements: JSON.stringify(['3+ years React', 'Strong CSS skills']), benefits: JSON.stringify(['Flexible hours', 'Health & dental']), featured: 0 },
    { title: 'UI Engineer', company: 'Linear', logo: '📐', location: 'Remote', type: 'Full-time', salary: '$110k – $150k', salary_min: 110000, salary_max: 150000, experience: 'Mid-level', tags: JSON.stringify(['React', 'Design Systems', 'TypeScript', 'Figma']), description: 'Linear is building the issue tracker for high-performance teams.', requirements: JSON.stringify(['React expertise', 'Design sensibility']), benefits: JSON.stringify(['Fully remote', 'Company retreats']), featured: 0 },
    { title: 'DevOps Engineer', company: 'GitHub', logo: '🐙', location: 'Remote', type: 'Full-time', salary: '$140k – $180k', salary_min: 140000, salary_max: 180000, experience: 'Senior', tags: JSON.stringify(['Kubernetes', 'Terraform', 'AWS', 'CI/CD']), description: 'GitHub is looking for a DevOps Engineer to help scale our infrastructure.', requirements: JSON.stringify(['Kubernetes', 'Terraform', 'AWS/GCP']), benefits: JSON.stringify(['Remote-first', 'Equity']), featured: 0 },
    { title: 'Backend Engineer', company: 'PlanetScale', logo: '🪐', location: 'Remote', type: 'Full-time', salary: '$125k – $165k', salary_min: 125000, salary_max: 165000, experience: 'Senior', tags: JSON.stringify(['Go', 'MySQL', 'Distributed Systems', 'gRPC']), description: 'PlanetScale builds the world\'s most scalable MySQL database.', requirements: JSON.stringify(['Go or Rust', 'MySQL internals']), benefits: JSON.stringify(['Fully remote', 'High equity']), featured: 1 },
    { title: 'Machine Learning Engineer', company: 'Hugging Face', logo: '🤗', location: 'Paris / Remote', type: 'Full-time', salary: '$115k – $160k', salary_min: 115000, salary_max: 160000, experience: 'Mid-level', tags: JSON.stringify(['Python', 'PyTorch', 'NLP', 'Transformers']), description: 'Join the team democratising AI. You\'ll train, fine-tune, and deploy NLP models.', requirements: JSON.stringify(['PyTorch/TensorFlow', 'NLP experience']), benefits: JSON.stringify(['Remote-friendly', 'Research time']), featured: 1 },
    { title: 'Product Designer', company: 'Figma', logo: '🎨', location: 'San Francisco, CA', type: 'Full-time', salary: '$130k – $170k', salary_min: 130000, salary_max: 170000, experience: 'Senior', tags: JSON.stringify(['Figma', 'UI/UX', 'Prototyping', 'Design Systems']), description: 'Design the tools that designers use.', requirements: JSON.stringify(['5+ years product design', 'Figma proficiency']), benefits: JSON.stringify(['Equity', 'Learning stipend']), featured: 0 },
  ];
  for (const job of JOBS) {
    db.run(
      `INSERT INTO jobs (title,company,logo,location,type,salary,salary_min,salary_max,experience,tags,description,requirements,benefits,featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [job.title, job.company, job.logo, job.location, job.type, job.salary, job.salary_min, job.salary_max, job.experience, job.tags, job.description, job.requirements, job.benefits, job.featured]
    );
  }
  console.log(`✅ Seeded ${JOBS.length} jobs`);
}
