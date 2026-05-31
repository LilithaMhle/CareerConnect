import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { JOBS } from '../data/mockData';

const AppContext = createContext(null);

const API = '/api';

// ─── Status helpers (used by both seeker and employer views) ──────────────────
export const STATUS_ORDER = ['unopened', 'opened', 'review', 'shortlisted', 'interview', 'accepted', 'rejected'];

export const STATUS_META = {
  unopened:    { label: 'Unopened',         color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.07)' },
  opened:      { label: 'Opened',           color: '#60a5fa',               bg: 'rgba(96,165,250,0.12)' },
  review:      { label: 'Under Review',     color: '#f59e0b',               bg: 'rgba(245,158,11,0.12)' },
  shortlisted: { label: 'Shortlisted',      color: '#2DD4A4',               bg: 'rgba(45,212,164,0.12)' },
  interview:   { label: 'Interview Booked', color: '#7C6FE0',               bg: 'rgba(124,111,224,0.12)' },
  accepted:    { label: 'Accepted',         color: '#4ade80',               bg: 'rgba(74,222,128,0.12)' },
  rejected:    { label: 'Rejected',         color: '#f87171',               bg: 'rgba(239,68,68,0.12)' },
};

export const CANDIDATE_STATUS_MESSAGES = {
  unopened:    "Your application has been submitted and is awaiting review by the hiring team.",
  opened:      "Great news — your application has been opened by the hiring team.",
  review:      "Your documents are currently being reviewed. This typically takes 3–5 business days.",
  shortlisted: "You've been shortlisted! Keep an eye on your email for an interview invitation.",
  interview:   "An interview has been booked. Check your email for the details and prepare thoroughly.",
  accepted:    "Congratulations — your application has been accepted! The team will be in touch soon.",
  rejected:    null,
};

// ─── API helper ───────────────────────────────────────────────────────────────
async function apiCall(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('cc_token'));
  const [toasts, setToasts] = useState([]);
  const [showApplyGate, setShowApplyGate] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState(JOBS);  // fallback to mock data initially
  const [loading, setLoading] = useState(false);

  // ─── Toast ─────────────────────────────────────────────────────────────────
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800);
  }, []);

  // ─── Bootstrap: restore session from token ─────────────────────────────────
  useEffect(() => {
    if (!token) return;
    apiCall('/auth/me', {}, token)
      .then(data => {
        setUser(data.user);
        loadApplications(data.user, token);
      })
      .catch(() => {
        localStorage.removeItem('cc_token');
        setToken(null);
      });
  }, []);

  // ─── Load jobs from API (with fallback to mock) ────────────────────────────
  useEffect(() => {
    apiCall('/jobs?limit=50')
      .then(data => { if (data.jobs?.length) setJobs(data.jobs); })
      .catch(() => {/* keep mock data */});
  }, []);

  function loadApplications(u, t) {
    if (!u) return;
    const path = u.role === 'employer' ? '/applications' : '/applications/mine';
    apiCall(path, {}, t)
      .then(data => setApplications(data.applications || []))
      .catch(() => {});
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password, role) => {
    setLoading(true);
    try {
      // Try real API first
      const data = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('cc_token', data.token);
      setToken(data.token);
      setUser(data.user);
      loadApplications(data.user, data.token);
      toast(`Welcome back, ${data.user.name || email.split('@')[0]}!`);
      return { success: true, user: data.user };
    } catch (err) {
      // Fallback: demo login (no server needed)
      if (email === 'demo@example.com' || email.includes('@')) {
        const demoUser = { id: 0, email, role: role || 'seeker', name: email.split('@')[0] };
        setUser(demoUser);
        toast(`Welcome back, ${demoUser.name}!`);
        return { success: true, user: demoUser };
      }
      toast(err.message || 'Login failed', 'error');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signup = useCallback(async (email, password, role, name) => {
    setLoading(true);
    try {
      const data = await apiCall('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role, name }) });
      localStorage.setItem('cc_token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast(`Account created! Welcome, ${data.user.name}!`);
      return { success: true, user: data.user };
    } catch (err) {
      toast(err.message || 'Registration failed', 'error');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const logout = useCallback(() => {
    localStorage.removeItem('cc_token');
    setToken(null);
    setUser(null);
    setApplications([]);
    toast('Logged out successfully');
  }, [toast]);

  // ─── Seeker: save / apply ──────────────────────────────────────────────────
  const saveJob = useCallback(async (job) => {
    if (token) {
      try {
        const data = await apiCall('/applications/saved', { method: 'POST', body: JSON.stringify({ job_id: job.id }) }, token);
        toast(data.message || (data.saved ? 'Job saved!' : 'Job removed from saved'));
        setSavedJobs(prev => data.saved ? [...prev, job] : prev.filter(j => j.id !== job.id));
        return;
      } catch {}
    }
    // Fallback: in-memory only
    setSavedJobs(prev => {
      const exists = prev.find(j => j.id === job.id);
      if (exists) { toast('Job removed from saved'); return prev.filter(j => j.id !== job.id); }
      toast('Job saved!');
      return [...prev, job];
    });
  }, [token, toast]);

  const applyToJob = useCallback(async (job) => {
    if (!user) { setShowApplyGate(true); return false; }

    if (token) {
      try {
        const data = await apiCall('/applications', { method: 'POST', body: JSON.stringify({ job_id: job.id }) }, token);
        setApplications(prev => [...prev, data.application]);
        toast(`Application submitted to ${job.company}!`);
        return true;
      } catch (err) {
        if (err.message.includes('Already applied')) {
          toast('Already applied!', 'info');
          return false;
        }
        toast(err.message, 'error');
        return false;
      }
    }

    // In-memory fallback
    const alreadyApplied = applications.find(a => a.job_id === job.id || a.jobId === job.id);
    if (alreadyApplied) { toast('Already applied!', 'info'); return false; }
    const now = new Date();
    const ts = now.toISOString().replace('T', ' ').slice(0, 16);
    const dateStr = now.toISOString().split('T')[0];
    const newApp = {
      id: Date.now(), job_id: job.id, jobId: job.id,
      job_title: job.title, jobTitle: job.title,
      company: job.company, logo: job.logo || '🏢',
      candidateName: user.name, candidate_name: user.name,
      candidateEmail: user.email, candidate_email: user.email,
      status: 'unopened', applied_at: dateStr, updated_at: dateStr, employer_note: '',
      status_history: [{ status: 'submitted', timestamp: ts, note: 'Application submitted.' }],
      statusHistory: [{ status: 'submitted', timestamp: ts, note: 'Application submitted.' }],
    };
    setApplications(prev => [...prev, newApp]);
    toast(`Application submitted to ${job.company}!`);
    return true;
  }, [user, token, applications, toast]);

  // ─── Employer: update status ───────────────────────────────────────────────
  const updateApplicationStatus = useCallback(async (appId, newStatus, note = '') => {
    if (token) {
      try {
        const data = await apiCall(`/applications/${appId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus, note }),
        }, token);
        setApplications(prev => prev.map(a => a.id === appId ? data.application : a));
        toast(`Status updated to "${STATUS_META[newStatus]?.label}"`);
        return;
      } catch {}
    }
    // In-memory fallback
    const now = new Date();
    const ts = now.toISOString().replace('T', ' ').slice(0, 16);
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;
      const history = app.status_history || app.statusHistory || [];
      const newHistory = [...history, { status: newStatus, timestamp: ts, note: note || `Status updated to ${newStatus}.` }];
      return { ...app, status: newStatus, employer_note: newStatus === 'rejected' ? note : app.employer_note,
               status_history: newHistory, statusHistory: newHistory, updated_at: ts.split(' ')[0] };
    }));
    toast(`Status updated to "${STATUS_META[newStatus]?.label}"`);
  }, [token, toast]);

  const openApplication = useCallback((appId) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== appId || app.status !== 'unopened') return app;
      const now = new Date();
      const ts = now.toISOString().replace('T', ' ').slice(0, 16);
      const history = [...(app.status_history || app.statusHistory || []),
        { status: 'opened', timestamp: ts, note: 'Application opened by hiring team.' }];
      return { ...app, status: 'opened', updated_at: ts.split(' ')[0], status_history: history, statusHistory: history };
    }));
  }, []);

  // ─── Derived ───────────────────────────────────────────────────────────────
  const seekerApplications = user
    ? applications.filter(a => !a.candidate_email || a.candidate_email === user.email || a.candidateEmail === user.email)
    : [];
  const employerApplications = applications;

  return (
    <AppContext.Provider value={{
      user, login, logout, signup, loading, token,
      toasts, toast,
      showApplyGate, setShowApplyGate,
      savedJobs, saveJob,
      jobs, setJobs,
      applications,
      seekerApplications,
      employerApplications,
      applyToJob,
      updateApplicationStatus,
      openApplication,
      setApplications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
