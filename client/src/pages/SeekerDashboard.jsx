import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { JobCard } from '../components/Shared';

const STATUS_META = {
  unopened:    { label: 'Submitted',        color: 'rgba(255,255,255,0.5)',  bg: 'rgba(255,255,255,0.07)', msg: 'Your application has been submitted and is awaiting review.' },
  opened:      { label: 'Opened',           color: '#60a5fa',               bg: 'rgba(96,165,250,0.12)',  msg: 'Great news — the employer has opened your application.' },
  review:      { label: 'Under Review',     color: '#f59e0b',               bg: 'rgba(245,158,11,0.12)',  msg: 'Your application is currently being reviewed. This typically takes 3–5 business days.' },
  shortlisted: { label: 'Shortlisted',      color: 'var(--teal)',           bg: 'rgba(45,212,164,0.12)', msg: 'You\'ve been shortlisted! Keep an eye on your email for an interview invitation.' },
  interview:   { label: 'Interview Booked', color: 'var(--purple-light)',   bg: 'rgba(124,111,224,0.12)', msg: 'An interview has been booked. Check your email for details and prepare thoroughly.' },
  accepted:    { label: 'Accepted 🎉',      color: '#4ade80',               bg: 'rgba(74,222,128,0.12)',  msg: 'Congratulations — your application has been accepted! The team will be in touch soon.' },
  rejected:    { label: 'Unsuccessful',     color: '#f87171',               bg: 'rgba(239,68,68,0.1)',    msg: null },
};

// AI rejection analysis
const REJECTION_TIPS = [
  'Your skills may not have fully matched the job requirements. Review the job description and identify gaps.',
  'Consider adding certifications or side projects that demonstrate the required skills.',
  'Tailor your application to each job rather than using a generic CV.',
  'Competition for this role was likely very high — keep applying to similar positions.',
  'Use the Interview Prep tool to strengthen your answers for next time.',
];

function RejectionAnalysis({ app }) {
  const tip = REJECTION_TIPS[app.id % REJECTION_TIPS.length];
  return (
    <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(124,111,224,0.1)', border: '1px solid rgba(124,111,224,0.25)' }}>
      <p style={{ fontSize: 12, color: 'var(--purple-light)', fontWeight: 600, marginBottom: 5 }}>✦ AI Insight — Possible Reason for Rejection</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{tip}</p>
      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8 }}>Don't give up — every application is a learning opportunity.</p>
    </div>
  );
}

export default function SeekerDashboard() {
  const { user, seekerApplications, savedJobs, jobs } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) { navigate('/login'); return null; }

  const apps = seekerApplications;
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const stats = {
    matched: jobs.length,
    applied: apps.length,
    interviews: apps.filter(a => a.status === 'interview').length,
    saved: savedJobs.length,
  };

  const tabs = [
    { id: 'overview',    label: '🏠 Dashboard' },
    { id: 'tracker',     label: '📋 Application Tracker' },
    { id: 'saved',       label: '♥ Saved Jobs' },
    { id: 'recommended', label: '🤖 AI Matches' },
  ];

  const sideNavStyle = (id) => ({
    border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', width: '100%',
  });

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', position: 'relative', zIndex: 1 }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple), var(--teal-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10, boxShadow: '0 4px 16px rgba(124,111,224,0.35)' }}>{initials}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 3 }}>Job Seeker</div>
          {apps.length > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(45,212,164,0.1)', border: '1px solid rgba(45,212,164,0.2)', borderRadius: 20, padding: '3px 9px', fontSize: 10, color: 'var(--teal)', marginTop: 8 }}>
              ✓ {apps.length} application{apps.length !== 1 ? 's' : ''} sent
            </div>
          )}
        </div>
        <nav style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`s-item ${activeTab === t.id ? 'active' : ''}`}
              style={sideNavStyle(t.id)}>
              {t.label}
            </button>
          ))}
          <button onClick={() => navigate('/interview-prep')}
            className="s-item" style={sideNavStyle('interview')}>
            🎤 Interview Prep
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                Good morning, {user.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Here's your AI-powered job activity</p>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
              {[
                { n: stats.matched,    l: 'AI-matched jobs',     c: 'var(--purple-light)' },
                { n: stats.applied,    l: 'Applications sent',   c: 'var(--teal)' },
                { n: stats.interviews, l: 'Interviews pending',  c: '#fb923c' },
                { n: stats.saved,      l: 'Saved jobs',          c: '#60a5fa' },
              ].map(s => (
                <div key={s.l} className="glass-card" style={{ padding: '18px 20px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: s.c, lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Recent applications */}
            {apps.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 14 }}>Recent Applications</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {apps.slice(0, 4).map(app => {
                    const m = STATUS_META[app.status] || STATUS_META.unopened;
                    return (
                      <div key={app.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ fontSize: 22, width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{app.logo || '🏢'}</div>
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{app.job_title || app.jobTitle}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{app.company} · {app.applied_at?.slice(0,10) || 'recently'}</div>
                          </div>
                        </div>
                        <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', color: m.color, background: m.bg, border: `1px solid ${m.color}40` }}>
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {apps.length > 4 && (
                  <button onClick={() => setActiveTab('tracker')} className="btn-ghost" style={{ marginTop: 10, padding: '9px 18px', fontSize: 12, cursor: 'pointer' }}>
                    View all {apps.length} applications →
                  </button>
                )}
              </div>
            )}

            {/* Recommended jobs */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 14 }}>Top AI Recommendations</h2>
              {jobs.slice(0, 3).map(job => <JobCard key={job.id} job={job} />)}
              <button onClick={() => navigate('/browse')} className="btn-ghost" style={{ marginTop: 8, padding: '9px 18px', fontSize: 12, cursor: 'pointer' }}>
                Browse all jobs →
              </button>
            </div>
          </>
        )}

        {/* ── Application Tracker ── */}
        {activeTab === 'tracker' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Application Tracker</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-time status updates from employers</p>
            </div>

            {apps.length === 0 ? (
              <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 15 }}>No applications yet.</p>
                <button onClick={() => navigate('/browse')} className="btn-teal" style={{ padding: '11px 24px', cursor: 'pointer', fontSize: 13 }}>Browse Jobs</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {apps.map(app => {
                  const m = STATUS_META[app.status] || STATUS_META.unopened;
                  const history = app.status_history || app.statusHistory || [];
                  return (
                    <div key={app.id} className="glass-card" style={{ padding: 20, borderLeft: `3px solid ${m.color}` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ fontSize: 22, width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {app.logo || '🏢'}
                          </div>
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>{app.job_title || app.jobTitle}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{app.company}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>Applied: {app.applied_at?.slice(0,10) || 'recently'}</div>
                          </div>
                        </div>
                        <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', color: m.color, background: m.bg, border: `1px solid ${m.color}40`, flexShrink: 0 }}>
                          {m.label}
                        </span>
                      </div>

                      {/* Status message */}
                      {m.msg && (
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: history.length > 0 ? 14 : 0 }}>{m.msg}</p>
                      )}

                      {/* AI rejection insight */}
                      {app.status === 'rejected' && <RejectionAnalysis app={app} />}

                      {/* Status timeline */}
                      {history.length > 1 && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                          <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>Activity Timeline</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {history.map((h, i) => (
                              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0, marginTop: 5 }} />
                                <div>
                                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{h.note || h.status}</span>
                                  <span style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 8 }}>{h.timestamp}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Saved Jobs ── */}
        {activeTab === 'saved' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Saved Jobs</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{savedJobs.length} saved role{savedJobs.length !== 1 ? 's' : ''}</p>
            </div>
            {savedJobs.length === 0 ? (
              <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 15 }}>No saved jobs yet.</p>
                <button onClick={() => navigate('/browse')} className="btn-teal" style={{ padding: '11px 24px', cursor: 'pointer', fontSize: 13 }}>Browse Jobs</button>
              </div>
            ) : (
              savedJobs.map(job => <JobCard key={job.id} job={job} />)
            )}
          </>
        )}

        {/* ── AI Matches ── */}
        {activeTab === 'recommended' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>AI Job Matches</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Jobs ranked by how well they match your profile</p>
            </div>
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </>
        )}
      </main>
    </div>
  );
}
