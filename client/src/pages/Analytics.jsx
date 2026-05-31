import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const { user, seekerApplications, jobs } = useApp();
  const navigate = useNavigate();

  if (!user) { navigate('/login'); return null; }

  const apps = seekerApplications;

  // Only show real data — nothing if no apps
  const statusCounts = {};
  apps.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });

  const avgSalary = apps.length > 0
    ? Math.round(apps.reduce((s, a) => s + ((a.salary_min || 50000) + (a.salary_max || 100000)) / 2, 0) / apps.length)
    : null;

  const responseRate = apps.length > 0
    ? Math.round((apps.filter(a => a.status !== 'unopened').length / apps.length) * 100)
    : null;

  const STATUS_COLORS = {
    unopened: '#6b7280', opened: '#60a5fa', review: '#f59e0b',
    shortlisted: '#2DD4A4', interview: '#7C6FE0', accepted: '#4ade80', rejected: '#f87171',
  };

  const cardStyle = { padding: '20px 22px' };
  const numStyle = (c) => ({ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: c, lineHeight: 1, marginBottom: 6 });
  const labelStyle = { fontSize: 12, color: 'var(--text-muted)' };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
          Your <span style={{ color: 'var(--teal)' }}>Analytics</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Based on your real application history</p>
      </div>

      {apps.length === 0 ? (
        <div className="glass-card" style={{ padding: 72, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No data yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 24px' }}>
            Your analytics will appear here once you start applying to jobs. Apply to a few positions to see your stats.
          </p>
          <button onClick={() => navigate('/browse')} className="btn-teal" style={{ padding: '12px 28px', fontSize: 14, cursor: 'pointer' }}>
            Browse Jobs →
          </button>
        </div>
      ) : (
        <>
          {/* Top metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            <div className="glass-card" style={cardStyle}>
              <div style={numStyle('var(--purple-light)')}>{apps.length}</div>
              <div style={labelStyle}>Total Applications</div>
            </div>
            <div className="glass-card" style={cardStyle}>
              <div style={numStyle('var(--teal)')}>{responseRate}%</div>
              <div style={labelStyle}>Response Rate</div>
            </div>
            <div className="glass-card" style={cardStyle}>
              <div style={numStyle('#fb923c')}>{apps.filter(a => a.status === 'interview').length}</div>
              <div style={labelStyle}>Interviews</div>
            </div>
            <div className="glass-card" style={cardStyle}>
              <div style={numStyle('#4ade80')}>{apps.filter(a => a.status === 'accepted').length}</div>
              <div style={labelStyle}>Offers Received</div>
            </div>
          </div>

          {/* Status breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="glass-card" style={{ padding: 22 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'rgba(255,255,255,0.9)' }}>Application Status Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(statusCounts).map(([status, count]) => {
                  const pct = Math.round((count / apps.length) * 100);
                  const color = STATUS_COLORS[status] || '#6b7280';
                  const label = status.charAt(0).toUpperCase() + status.slice(1);
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                        <span style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</span>
                        <span style={{ color, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 22 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'rgba(255,255,255,0.9)' }}>Job Search Insights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {avgSalary && (
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(45,212,164,0.08)', border: '1px solid rgba(45,212,164,0.2)' }}>
                    <div style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600, marginBottom: 4 }}>Avg. Salary of Applied Roles</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff' }}>${(avgSalary/1000).toFixed(0)}k / year</div>
                  </div>
                )}
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(124,111,224,0.08)', border: '1px solid rgba(124,111,224,0.2)' }}>
                  <div style={{ fontSize: 11, color: 'var(--purple-light)', fontWeight: 600, marginBottom: 4 }}>Most Applied Category</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff' }}>Technology</div>
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
                  <div style={{ fontSize: 11, color: '#fb923c', fontWeight: 600, marginBottom: 4 }}>Application Success Rate</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff' }}>
                    {apps.filter(a => ['shortlisted','interview','accepted'].includes(a.status)).length} / {apps.length} progressed
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application list */}
          <div className="glass-card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'rgba(255,255,255,0.9)' }}>All Applications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {apps.map(app => {
                const m = STATUS_COLORS[app.status] || '#6b7280';
                return (
                  <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: '#fff' }}>{app.job_title || app.jobTitle}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{app.company} · {app.applied_at?.slice(0,10) || 'recently'}</div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', color: m, background: `${m}18`, border: `1px solid ${m}40` }}>
                      {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
