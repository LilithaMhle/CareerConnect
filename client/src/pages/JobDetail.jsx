import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MatchRing } from '../components/Shared';
import { useApp } from '../context/AppContext';
import { JOBS } from '../data/mockData';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, applyToJob, saveJob, savedJobs, setShowApplyGate, applications } = useApp();
  const job = JOBS.find(j => j.id === +id);

  if (!job) return (
    <div style={{ maxWidth: 800, margin: '80px auto', textAlign: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Job not found.</p>
      <button onClick={() => navigate('/browse')} className="btn-teal" style={{ marginTop: 20, padding: '10px 24px', cursor: 'pointer' }}>Browse Jobs</button>
    </div>
  );

  const isSaved = savedJobs.find(j => j.id === job.id);
  const alreadyApplied = applications.find(a => a.jobId === job.id);

  const handleApply = () => {
    if (!user) { setShowApplyGate(true); return; }
    applyToJob(job);
  };

  const skillColor = (type) => type === 'match' ? '#2DD4A4' : type === 'missing' ? '#f87171' : '#f59e0b';
  const skillIcon = (type) => type === 'match' ? '✓' : type === 'missing' ? '✕' : '≈';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
        ← Back
      </button>

      {/* Header */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 52, background: 'rgba(255,255,255,0.06)', borderRadius: 16, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {job.logo}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{job.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 12 }}>{job.company} · {job.location}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {job.tags.map(t => (
                <span key={t} style={{ background: 'rgba(45,212,164,0.1)', border: '1px solid rgba(45,212,164,0.2)', color: '#2DD4A4', borderRadius: 20, padding: '3px 12px', fontSize: 13 }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
              <span>💰 {job.salary}</span>
              <span>⏱ {job.type}</span>
              <span>📊 {job.experience}</span>
              <span>🕒 {job.posted}</span>
            </div>
          </div>
          <MatchRing score={job.match} size={90} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleApply} className="btn-teal" style={{ padding: '12px 32px', fontSize: 16, cursor: 'pointer' }}
            disabled={!!alreadyApplied}>
            {alreadyApplied ? '✓ Applied' : 'Apply Now'}
          </button>
          <button onClick={() => saveJob(job)} className="btn-ghost" style={{ padding: '12px 20px', fontSize: 15, cursor: 'pointer' }}>
            {isSaved ? '♥ Saved' : '♡ Save Job'}
          </button>
        </div>
        {!user && (
          <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            💡 <span style={{ color: '#7C6FE0', cursor: 'pointer' }} onClick={() => setShowApplyGate(true)}>Create a free account</span> to apply and track this application.
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Description */}
        <div>
          <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>About the Role</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: 15 }}>{job.description}</p>
          </div>

          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Requirements</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {job.requirements.map(r => (
                <li key={r} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 15, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#2DD4A4', flexShrink: 0 }}>→</span> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div className="glass-card" style={{ padding: 24, alignSelf: 'start' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Skill Match Analysis</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>Based on your profile</p>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Matched</p>
            {job.userSkills.map(s => (
              <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(45,212,164,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#2DD4A4', flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{s}</span>
              </div>
            ))}
          </div>

          {job.partialSkills?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Partial Match</p>
              {job.partialSkills.map(s => (
                <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#f59e0b', flexShrink: 0 }}>≈</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {job.missingSkills?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Missing Skills</p>
              {job.missingSkills.map(s => (
                <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#f87171', flexShrink: 0 }}>✕</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{s}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: '12px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: '#f87171' }}>💡 Close these skill gaps with targeted learning to boost your match score.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
