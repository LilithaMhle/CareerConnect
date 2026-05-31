import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INTERVIEW_QUESTIONS } from '../data/mockData';

function Accordion({ q }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card" style={{ marginBottom: 10, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', background: 'none', border: 'none', padding: '18px 22px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
            {q.skillGap && (
              <span style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                ⚠ Gap in your profile
              </span>
            )}
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 15, color: 'white', lineHeight: 1.4 }}>{q.question}</span>
        </div>
        <span style={{ color: '#2DD4A4', fontSize: 18, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>+</span>
      </button>
      <div className={`accordion-content ${open ? 'open' : ''}`}>
        <div style={{ padding: '0 22px 22px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ paddingTop: 18 }}>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2DD4A4', marginBottom: 10 }}>Model Answer</h4>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: 14 }}>{q.answer}</p>
          </div>
          <div style={{ marginTop: 18, padding: 16, background: 'rgba(124,111,224,0.08)', border: '1px solid rgba(124,111,224,0.2)', borderRadius: 10 }}>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C6FE0', marginBottom: 8 }}>💡 Expert Interviewer Tip</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: 13 }}>{q.tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewPrep() {
  const { user } = useApp();
  const categories = Object.keys(INTERVIEW_QUESTIONS);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Syne', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Interview <span style={{ color: '#2DD4A4' }}>Preparation</span>
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 36, fontSize: 15 }}>
        AI-curated questions with model answers and expert tips.
        {user && <span style={{ color: '#f87171' }}> Questions flagged ⚠ are linked to skill gaps in your profile.</span>}
      </p>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: activeCategory === cat ? 'rgba(45,212,164,0.15)' : 'rgba(255,255,255,0.06)',
            border: activeCategory === cat ? '1px solid rgba(45,212,164,0.35)' : '1px solid rgba(255,255,255,0.1)',
            color: activeCategory === cat ? '#2DD4A4' : 'rgba(255,255,255,0.65)',
            transition: 'all 0.2s',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="fade-in" key={activeCategory}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700 }}>{activeCategory}</h2>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{INTERVIEW_QUESTIONS[activeCategory]?.length || 0} questions</span>
        </div>
        {(INTERVIEW_QUESTIONS[activeCategory] || []).map(q => <Accordion key={q.id} q={q} />)}
      </div>
    </div>
  );
}
