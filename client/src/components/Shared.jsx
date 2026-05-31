import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// ─── Gem logo icon ────────────────────────────────────────────────────────────
function GemLogo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: 'linear-gradient(135deg, #7C6FE0, #2DD4A4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, flexShrink: 0,
      boxShadow: '0 4px 16px rgba(124,111,224,0.45)',
    }}>💼</div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const linkStyle = {
    color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
    padding: '7px 14px', borderRadius: 8, fontSize: 13,
    fontFamily: 'var(--font-body)', fontWeight: 500,
    transition: 'color 0.15s',
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(6,4,15,0.8)',
      backdropFilter: 'blur(28px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <GemLogo size={32} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Career<span style={{ color: 'var(--teal)' }}>Connect</span> AI
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/browse" style={linkStyle}
            onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}>
            Browse Jobs
          </Link>

          {!user ? (
            <>
              <Link to="/login" style={linkStyle}
                onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}>
                Sign in
              </Link>
              <Link to="/signup" className="btn-purple" style={{ textDecoration: 'none', padding: '7px 16px', fontSize: 13 }}>
                Get started
              </Link>
            </>
          ) : user.role === 'employer' ? (
            <>
              <Link to="/employer" style={linkStyle}
                onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}>
                Dashboard
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, padding: '0 8px' }}>{user.name}</span>
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={linkStyle}
                onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}>
                Dashboard
              </Link>
              <Link to="/analytics" style={linkStyle}
                onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}>
                Analytics
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, padding: '0 8px' }}>{user.name}</span>
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} className="toast-in" style={{
          background: t.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(45,212,164,0.12)',
          border: `1px solid ${t.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(45,212,164,0.35)'}`,
          backdropFilter: 'blur(16px)', borderRadius: 12, padding: '12px 20px',
          fontSize: 13, fontWeight: 500,
          color: t.type === 'error' ? '#f87171' : '#2DD4A4',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxWidth: 320,
        }}>
          {t.type === 'error' ? '✕ ' : '✓ '}{t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Apply Gate Modal (unauthenticated) ───────────────────────────────────────
export function ApplyGateModal() {
  const { showApplyGate, setShowApplyGate } = useApp();
  const navigate = useNavigate();
  if (!showApplyGate) return null;
  return (
    <div className="modal-overlay" onClick={() => setShowApplyGate(false)}>
      <div className="glass-card fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, width: '100%', padding: 40, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#7C6FE0,#2DD4A4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px' }}>🚀</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Create a free account to apply</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.65, fontSize: 14 }}>
          Sign up to apply for jobs, upload your CV, and track all your applications in one place.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => { setShowApplyGate(false); navigate('/signup'); }} className="btn-teal" style={{ padding: '11px 26px', fontSize: 14, cursor: 'pointer' }}>
            Create Free Account
          </button>
          <button onClick={() => { setShowApplyGate(false); navigate('/login'); }} className="btn-ghost" style={{ padding: '11px 20px', fontSize: 14, cursor: 'pointer' }}>
            Sign in
          </button>
        </div>
        <button onClick={() => setShowApplyGate(false)} style={{ marginTop: 18, background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 12 }}>
          Continue browsing
        </button>
      </div>
    </div>
  );
}

// ─── Apply Modal (authenticated) ──────────────────────────────────────────────
export function ApplyModal({ job, onClose }) {
  const { applyToJob } = useApp();
  const [coverLetter, setCoverLetter] = useState('');
  const [files, setFiles] = useState({ cv: null, id: null, matric: null, academic: null });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const refs = { cv: useRef(), id: useRef(), matric: useRef(), academic: useRef() };

  const handleFile = (key, e) => { if (e.target.files[0]) setFiles(p => ({ ...p, [key]: e.target.files[0] })); };

  const handleSubmit = async () => {
    setLoading(true);
    const ok = await applyToJob(job);
    setLoading(false);
    if (ok !== false) setSubmitted(true);
  };

  if (!job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card fade-in" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 560, width: '100%', padding: 36, maxHeight: '90vh', overflowY: 'auto' }}>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#0FA878,#2DD4A4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--teal)', marginBottom: 10 }}>Application Sent!</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 8, fontSize: 14 }}>
              Your application for <strong style={{ color: '#fff' }}>{job.title}</strong> at <strong style={{ color: '#fff' }}>{job.company}</strong> has been submitted.
            </p>
            <p style={{ color: 'var(--text-faint)', fontSize: 13, marginBottom: 28 }}>Track the status in Dashboard → Application Tracker.</p>
            <button onClick={onClose} className="btn-teal" style={{ padding: '12px 32px', fontSize: 14, cursor: 'pointer' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Apply — {job.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{job.company} · {job.location}</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 500, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                Cover Letter <span style={{ color: 'var(--text-faint)', textTransform: 'none' }}>(optional)</span>
              </label>
              <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit for this role..."
                rows={4} style={{ resize: 'vertical', minHeight: 90 }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 500, marginBottom: 12, textTransform: 'uppercase' }}>Upload Documents</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'cv',       label: '📄 CV / Resume',         required: true },
                  { key: 'id',       label: '🪪 ID Document',          required: false },
                  { key: 'matric',   label: '🎓 Matric Certificate',   required: false },
                  { key: 'academic', label: '📚 Academic Record',      required: false },
                ].map(({ key, label, required }) => (
                  <div key={key}>
                    <input ref={refs[key]} type="file" accept=".pdf,.doc,.docx,.jpg,.png" style={{ display: 'none' }} onChange={e => handleFile(key, e)} />
                    <button onClick={() => refs[key].current.click()} style={{
                      width: '100%', padding: '11px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 12, textAlign: 'left',
                      background: files[key] ? 'rgba(45,212,164,0.1)' : 'rgba(255,255,255,0.05)',
                      border: files[key] ? '1px solid rgba(45,212,164,0.4)' : '1px dashed rgba(255,255,255,0.18)',
                      color: files[key] ? 'var(--teal)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      {files[key] ? `✓ ${files[key].name.slice(0, 18)}…` : label}
                      {required && !files[key] && <span style={{ color: '#f87171', marginLeft: 4 }}>*</span>}
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8 }}>Accepted: PDF, DOC, DOCX, JPG, PNG · Max 5 MB each</p>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="btn-teal"
              style={{ width: '100%', padding: '13px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, justifyContent: 'center' }}>
              {loading ? 'Submitting…' : '✈ Submit Application'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Match Ring ────────────────────────────────────────────────────────────────
export function MatchRing({ score, size = 60 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#2DD4A4' : score >= 60 ? '#f59e0b' : '#f87171';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size > 80 ? 20 : 13, color }}>{score}%</span>
        {size > 80 && <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>match</span>}
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
export function JobCard({ job }) {
  const { user, saveJob, savedJobs, setShowApplyGate } = useApp();
  const navigate = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const isSaved = savedJobs.find(j => j.id === job.id);
  const tags = Array.isArray(job.tags) ? job.tags : [];

  const handleApply = (e) => {
    e.stopPropagation();
    if (!user) { setShowApplyGate(true); return; }
    setShowApplyModal(true);
  };

  return (
    <>
      {showApplyModal && <ApplyModal job={job} onClose={() => setShowApplyModal(false)} />}
      <div className="glass-card" onClick={() => navigate(`/job/${job.id}`)}
        style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 12 }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(45,212,164,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Company logo */}
          <div style={{ fontSize: 26, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {job.logo || '🏢'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 3, color: '#fff' }}>{job.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{job.company} · {job.location}</p>
              </div>
              {job.match && <MatchRing score={job.match} size={52} />}
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '10px 0 12px' }}>
              {tags.slice(0, 5).map(t => (
                <span key={t} className="teal-tag" style={{ fontSize: 11 }}>{t}</span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-faint)' }}>
                {job.salary && <span>💰 {job.salary}</span>}
                {job.type && <span>⏱ {job.type}</span>}
                {job.experience && <span>📊 {job.experience}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                <button onClick={(e) => { e.stopPropagation(); saveJob(job); }} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                  {isSaved ? '♥ Saved' : '♡ Save'}
                </button>
                <button onClick={handleApply} className="btn-teal" style={{ padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
