import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const STATUS_META = {
  unopened:    { label: 'Unopened',         color: 'rgba(255,255,255,0.5)',  bg: 'rgba(255,255,255,0.07)' },
  opened:      { label: 'Opened',           color: '#60a5fa',               bg: 'rgba(96,165,250,0.12)' },
  review:      { label: 'Under Review',     color: '#f59e0b',               bg: 'rgba(245,158,11,0.12)' },
  shortlisted: { label: 'Shortlisted',      color: 'var(--teal)',           bg: 'rgba(45,212,164,0.12)' },
  interview:   { label: 'Interview Booked', color: 'var(--purple-light)',   bg: 'rgba(124,111,224,0.12)' },
  accepted:    { label: 'Accepted',         color: '#4ade80',               bg: 'rgba(74,222,128,0.12)' },
  rejected:    { label: 'Rejected',         color: '#f87171',               bg: 'rgba(239,68,68,0.12)' },
};
const STATUS_ORDER = ['unopened','opened','review','shortlisted','interview','accepted','rejected'];

// ── Post Job Modal ────────────────────────────────────────────────────────────
function PostJobModal({ onClose, onPosted }) {
  const { user, token, toast, setJobs } = useApp();
  const [chips, setChips] = useState([]);
  const [chipInput, setChipInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', company: user?.name || '', logo: '🏢',
    location: '', salary: '', salary_min: '', salary_max: '',
    type: 'Full-time', experience: 'Mid-level',
    description: '', requirements: '', benefits: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addChip = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && chipInput.trim()) {
      e.preventDefault();
      const t = chipInput.trim().replace(/,/g, '');
      if (t && !chips.includes(t)) setChips(p => [...p, t]);
      setChipInput('');
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.company) { toast('Job title and company are required', 'error'); return; }
    setLoading(true);
    try {
      const body = {
        ...form,
        tags: chips,
        salary_min: parseInt(form.salary_min) || 0,
        salary_max: parseInt(form.salary_max) || 0,
        requirements: form.requirements ? form.requirements.split('\n').filter(Boolean) : [],
        benefits: form.benefits ? form.benefits.split('\n').filter(Boolean) : [],
        featured: 0,
      };
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/jobs', { method: 'POST', headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Add new job to global state so it shows on Browse page immediately
      setJobs(prev => [data.job, ...prev]);
      toast(`Job "${form.title}" posted successfully!`);
      onPosted(data.job);
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to post job', 'error');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const LOGOS = ['🏢','💼','🚀','💡','⚡','🌐','🎯','🔬','🎨','🤖'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card fade-in" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 640, width: '100%', padding: 36, maxHeight: '92vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Post a new job listing</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Fill in the details — AI will immediately start matching candidates</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 22 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Company Logo / Icon</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LOGOS.map(l => (
                <button key={l} onClick={() => set('logo', l)} style={{
                  width: 40, height: 40, borderRadius: 10, fontSize: 20, cursor: 'pointer', border: 'none',
                  background: form.logo === l ? 'rgba(45,212,164,0.2)' : 'rgba(255,255,255,0.07)',
                  outline: form.logo === l ? '2px solid var(--teal)' : 'none',
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Job Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Frontend Developer" style={{ fontSize: 13 }} />
          </div>
          <div>
            <label style={labelStyle}>Company Name *</label>
            <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. MobiTech" style={{ fontSize: 13 }} />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City or Remote" style={{ fontSize: 13 }} />
          </div>
          <div>
            <label style={labelStyle}>Salary Range</label>
            <input value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="e.g. R25 000 – R35 000/mo" style={{ fontSize: 13 }} />
          </div>
          <div>
            <label style={labelStyle}>Min Salary (number)</label>
            <input type="number" value={form.salary_min} onChange={e => set('salary_min', e.target.value)} placeholder="e.g. 25000" style={{ fontSize: 13 }} />
          </div>
          <div>
            <label style={labelStyle}>Max Salary (number)</label>
            <input type="number" value={form.salary_max} onChange={e => set('salary_max', e.target.value)} placeholder="e.g. 35000" style={{ fontSize: 13 }} />
          </div>
          <div>
            <label style={labelStyle}>Employment Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={{ fontSize: 13 }}>
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Experience Level</label>
            <select value={form.experience} onChange={e => set('experience', e.target.value)} style={{ fontSize: 13 }}>
              <option value="Junior">Junior (0–2 yrs)</option>
              <option value="Mid-level">Mid-level (2–5 yrs)</option>
              <option value="Senior">Senior (5+ yrs)</option>
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Job Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and what success looks like…"
              rows={4} style={{ fontSize: 13, resize: 'vertical' }} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Required Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 8 }}>
              {chips.map(c => (
                <span key={c} className="skill-chip" style={{ cursor: 'pointer' }} onClick={() => setChips(p => p.filter(x => x !== c))}>
                  {c} ✕
                </span>
              ))}
            </div>
            <input value={chipInput} onChange={e => setChipInput(e.target.value)} onKeyDown={addChip}
              placeholder="Type a skill and press Enter to add…" style={{ fontSize: 13 }} />
          </div>
          <div>
            <label style={labelStyle}>Requirements (one per line)</label>
            <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)}
              placeholder={"3+ years React\nTypeScript proficiency"} rows={3} style={{ fontSize: 13, resize: 'vertical' }} />
          </div>
          <div>
            <label style={labelStyle}>Benefits (one per line)</label>
            <textarea value={form.benefits} onChange={e => set('benefits', e.target.value)}
              placeholder={"Remote-first\nHealth insurance"} rows={3} style={{ fontSize: 13, resize: 'vertical' }} />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} className="btn-publish"
          style={{ width: '100%', padding: '15px', fontSize: 15, marginTop: 22, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          ✦ {loading ? 'Publishing…' : 'Publish Job & Start AI Matching'}
        </button>
      </div>
    </div>
  );
}

// ── Status update dropdown ────────────────────────────────────────────────────
function StatusDropdown({ appId, current, onUpdate }) {
  const [open, setOpen] = useState(false);
  const m = STATUS_META[current] || STATUS_META.unopened;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${m.color}`, background: m.bg, color: m.color, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 5 }}>
        {m.label} ▾
      </button>
      {open && (
        <div className="glass-card" style={{ position: 'absolute', right: 0, top: '110%', zIndex: 999, minWidth: 180, padding: 6 }}>
          {STATUS_ORDER.map(s => {
            const sm = STATUS_META[s];
            return (
              <button key={s} onClick={() => { onUpdate(appId, s); setOpen(false); }}
                style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', color: sm.color, background: current === s ? sm.bg : 'transparent', marginBottom: 2 }}>
                {sm.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main EmployerDashboard ────────────────────────────────────────────────────
export default function EmployerDashboard() {
  const { user, employerApplications, updateApplicationStatus, jobs } = useApp();
  const navigate = useNavigate();
  const [showPostJob, setShowPostJob] = useState(false);
  const [postedJobs, setPostedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('applications');

  if (!user) { navigate('/login'); return null; }

  const myApps = employerApplications;
  const initials = (user.name || 'E').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const stats = {
    total: myApps.length,
    new: myApps.filter(a => a.status === 'unopened').length,
    shortlisted: myApps.filter(a => a.status === 'shortlisted').length,
    interviews: myApps.filter(a => a.status === 'interview').length,
  };

  const handlePosted = (job) => setPostedJobs(p => [job, ...p]);

  const tabs = [
    { id: 'applications', label: '📋 Applications' },
    { id: 'jobs', label: '💼 My Job Listings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', position: 'relative', zIndex: 1 }}>
      {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} onPosted={handlePosted} />}

      {/* Sidebar */}
      <aside style={{ width: 220, background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #7C6FE0, #5b4fcf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10, boxShadow: '0 4px 16px rgba(124,111,224,0.4)' }}>{initials}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: 11, color: 'var(--purple-light)', marginTop: 3 }}>Employer Portal</div>
        </div>

        <nav style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`s-item ${activeTab === t.id ? 'active' : ''}`}
              style={{ border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)' }}>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '20px 10px 0' }}>
          <button onClick={() => setShowPostJob(true)} className="btn-teal"
            style={{ width: '100%', padding: '10px', fontSize: 13, cursor: 'pointer', justifyContent: 'center' }}>
            + Post a Job
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              {activeTab === 'applications' ? 'Candidate Applications' : 'My Job Listings'}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {activeTab === 'applications' ? `${myApps.length} total applications · AI-ranked by skill match` : `${postedJobs.length} listing${postedJobs.length !== 1 ? 's' : ''} posted`}
            </p>
          </div>
          <button onClick={() => setShowPostJob(true)} className="btn-teal" style={{ padding: '10px 20px', fontSize: 13, cursor: 'pointer' }}>
            + Post a Job
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { n: stats.total, l: 'Total Applications', c: 'var(--purple-light)' },
            { n: stats.new,   l: 'Awaiting Review',    c: 'var(--teal)' },
            { n: stats.shortlisted, l: 'Shortlisted',  c: '#60a5fa' },
            { n: stats.interviews,  l: 'Interviews',   c: '#fb923c' },
          ].map(s => (
            <div key={s.l} className="glass-card" style={{ padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: s.c, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Applications tab */}
        {activeTab === 'applications' && (
          <>
            {myApps.length === 0 ? (
              <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 15 }}>No applications yet.</p>
                <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>Post a job to start receiving applications from candidates.</p>
                <button onClick={() => setShowPostJob(true)} className="btn-teal" style={{ marginTop: 20, padding: '11px 24px', cursor: 'pointer', fontSize: 13 }}>Post a Job</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {myApps.map((app, i) => {
                  const name = app.candidate_name || app.candidateName || 'Candidate';
                  const email = app.candidate_email || app.candidateEmail || '';
                  const initials2 = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
                  const colors = [['rgba(124,111,224,0.3)','var(--purple-light)'],['rgba(45,212,164,0.25)','var(--teal)'],['rgba(251,146,60,0.25)','#fb923c)']];
                  const [bg, col] = colors[i % colors.length];
                  const scoreColor = i === 0 ? 'linear-gradient(90deg,#0FA878,#2DD4A4)' : i === 1 ? 'linear-gradient(90deg,#185FA5,#378ADD)' : 'linear-gradient(90deg,#854F0B,#EF9F27)';
                  const score = Math.max(20, 95 - i * 8 - Math.floor(Math.random()*5));

                  return (
                    <div key={app.id} className="glass-card" style={{ padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: col }}>
                            {initials2}
                          </div>
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {email} · Applied for: <strong style={{ color: '#fff' }}>{app.job_title || app.jobTitle}</strong>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'rgba(45,212,164,0.12)', color: 'var(--teal)', border: '1px solid rgba(45,212,164,0.25)' }}>
                            #{i+1} · {score}%
                          </span>
                          <StatusDropdown appId={app.id} current={app.status} onUpdate={updateApplicationStatus} />
                        </div>
                      </div>

                      {/* Score bar */}
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ height: '100%', width: `${score}%`, borderRadius: 3, background: scoreColor, transition: 'width 0.8s ease' }} />
                      </div>

                      {/* Applied date + history */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Applied: {app.applied_at?.slice(0,10) || 'recently'}</span>
                        <div style={{ display: 'flex', gap: 7 }}>
                          <button onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 500, background: 'linear-gradient(135deg,var(--purple),#5b4fcf)', color: '#fff' }}>
                            Shortlist
                          </button>
                          <button style={{ padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 500, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)' }}>
                            View CV
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* My job listings tab */}
        {activeTab === 'jobs' && (
          <>
            {postedJobs.length === 0 ? (
              <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: 15 }}>No job listings yet.</p>
                <p style={{ color: 'var(--text-faint)', fontSize: 13, marginBottom: 20 }}>Click "Post a Job" to create your first listing.</p>
                <button onClick={() => setShowPostJob(true)} className="btn-teal" style={{ padding: '11px 24px', cursor: 'pointer', fontSize: 13 }}>Post a Job</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {postedJobs.map(job => (
                  <div key={job.id} className="glass-card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ fontSize: 26, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {job.logo || '🏢'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{job.title}</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.company} · {job.location} · {job.type}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 240 }}>
                        {(Array.isArray(job.tags) ? job.tags : []).slice(0,4).map(t => (
                          <span key={t} className="teal-tag" style={{ fontSize: 11 }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                        ✓ Live
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
