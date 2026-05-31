import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, run, get } from '../db/database.js';
import { authenticate } from '../middleware/middleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'careerconnect-dev-secret-change-in-production';

router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'seeker', name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!['seeker', 'employer'].includes(role)) return res.status(400).json({ error: 'Role must be seeker or employer' });

    const existing = get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const { lastInsertRowid } = run('INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)', [email, hashed, role, name || email.split('@')[0]]);

    const token = jwt.sign({ userId: lastInsertRowid, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: lastInsertRowid, email, role, name: name || email.split('@')[0] } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticate, (req, res) => {
  const user = get('SELECT id, email, role, name, bio, skills, created_at FROM users WHERE id = ?', [req.user.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { ...user, skills: user.skills ? JSON.parse(user.skills) : [] } });
});

router.put('/profile', authenticate, (req, res) => {
  const { name, bio, skills } = req.body;
  run('UPDATE users SET name=?, bio=?, skills=? WHERE id=?', [name, bio, skills ? JSON.stringify(skills) : null, req.user.userId]);
  res.json({ message: 'Profile updated' });
});

export default router;
