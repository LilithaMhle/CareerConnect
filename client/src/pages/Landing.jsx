import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobCard } from '../components/Shared';
import { useApp } from '../context/AppContext';

export default function Landing() {
  const navigate = useNavigate();
  const { jobs } = useApp();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(search)}`);
  };

  const featured = jobs.filter(j => j.featured).slice(0, 4);

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── Hero ── */}
      <section style={{ padding: '72px 24px 52px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* inner orb */}
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 320, background: 'radial-gradient(ellipse, rgba(124,111,224,0.3) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(45,212,164,0.1)', border: '1px solid rgba(45,212,164,0.3)', borderRadius: 40, padding: '5px 16px', fontSize: 11, color: 'var(--teal)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 24, position: 'relative' }}>
          ✦ Powered by AI &amp; NLP
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,6vw,54px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: 16, position: 'relative' }}>
          Find jobs that truly<br />
          <span style={{ background: 'linear-gradient(90deg, var(--teal), var(--purple-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            match your skills
          </span>
        </h1>

        <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7, position: 'relative' }}>
          Upload your CV and let our AI instantly match you to the best opportunities — no manual searching, no guesswork.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: 540, margin: '0 auto 48px', background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)', position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Job title, skill, or company…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '15px 20px', fontFamily: 'var(--font-body)' }} />
          <button type="submit" style={{ background: 'linear-gradient(135deg, var(--purple), #5b4fcf)', border: 'none', color: '#fff', padding: '0 26px', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontWeight: 500, borderRadius: '0 12px 12px 0' }}>
            🔍 Search jobs
          </button>
        </form>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', position: 'relative' }}>
          {[['12,400+','Active jobs'],['3,200+','Companies hiring'],['92%','Match accuracy'],['48h','Avg. to first interview']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--teal)' }}>{n}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          {[
            { ico: '🧠', color: 'rgba(124,111,224,0.2)', border: 'rgba(124,111,224,0.3)', label: 'Smart job matching', desc: 'AI compares your profile to every job posting and shows your match percentage instantly — no manual filtering needed.' },
            { ico: '📄', color: 'rgba(45,212,164,0.12)', border: 'rgba(45,212,164,0.25)', label: 'CV analyzer', desc: 'Upload your CV and our NLP engine automatically extracts skills, qualifications, and experience in seconds.' },
            { ico: '📊', color: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.25)', label: 'Skill gap analysis', desc: 'See exactly which skills you\'re missing for your dream role and get personalised learning recommendations.' },
          ].map(f => (
            <div key={f.label} className="glass-card" style={{ padding: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color, border: `1px solid ${f.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>
                {f.ico}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{f.label}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured jobs ── */}
      {featured.length > 0 && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Featured Opportunities</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Hand-picked roles from top companies</p>
            </div>
            <button onClick={() => navigate('/browse')} className="btn-ghost" style={{ padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}>
              View all →
            </button>
          </div>
          {featured.map(job => <JobCard key={job.id} job={job} />)}
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '48px 40px', background: 'rgba(124,111,224,0.08)', borderColor: 'rgba(124,111,224,0.25)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
            Ready to find your next role?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Join thousands of professionals who found their dream job using CareerConnect AI.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} className="btn-teal" style={{ padding: '13px 30px', fontSize: 15, cursor: 'pointer' }}>
              Get started free
            </button>
            <button onClick={() => navigate('/browse')} className="btn-ghost" style={{ padding: '13px 24px', fontSize: 15, cursor: 'pointer' }}>
              Browse jobs
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
