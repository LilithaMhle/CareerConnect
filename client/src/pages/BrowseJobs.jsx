import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { JobCard } from '../components/Shared';
import { useApp } from '../context/AppContext';

const INDUSTRIES = ['All Industries','Technology','Finance','Design','DevOps / Cloud','Data / AI','Backend','Frontend','Full Stack','Mobile'];
const INDUSTRY_KW = {
  'Technology':   ['react','node','typescript','javascript','python','java','go'],
  'Finance':      ['fintech','stripe','payments','banking','financial'],
  'Design':       ['figma','ui','ux','design','product designer'],
  'DevOps / Cloud':['devops','kubernetes','terraform','aws','docker','ci/cd'],
  'Data / AI':    ['machine learning','nlp','pytorch','tensorflow','data','ai','ml'],
  'Backend':      ['backend','node.js','go','python','postgresql','mysql','api'],
  'Frontend':     ['react','vue','angular','frontend','css','tailwind'],
  'Full Stack':   ['full stack','next.js','node','postgresql','vercel'],
  'Mobile':       ['react native','flutter','swift','kotlin','android','ios'],
};

export default function BrowseJobs() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { jobs: contextJobs } = useApp();

  const [query, setQuery]       = useState(params.get('q') || '');
  const [industry, setIndustry] = useState('All Industries');
  const [jobType, setJobType]   = useState('');
  const [experience, setExp]    = useState('');
  const [salaryMin, setSalary]  = useState(0);
  const [sortBy, setSort]       = useState('recent');
  const [skillInput, setSkillIn]= useState('');
  const [skillTags, setSkillTags]= useState([]);

  const addSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const t = skillInput.trim().replace(/,/g,'');
      if (t && !skillTags.includes(t)) setSkillTags(p => [...p, t]);
      setSkillIn('');
    }
  };

  const filtered = useMemo(() => {
    let jobs = [...contextJobs];
    if (query) {
      const q = query.toLowerCase();
      jobs = jobs.filter(j =>
        j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) ||
        (Array.isArray(j.tags)?j.tags:[]).some(t=>t.toLowerCase().includes(q)) ||
        j.description?.toLowerCase().includes(q)
      );
    }
    if (industry !== 'All Industries') {
      const kws = INDUSTRY_KW[industry] || [];
      jobs = jobs.filter(j => {
        const txt = `${j.title} ${j.description} ${(Array.isArray(j.tags)?j.tags:[]).join(' ')}`.toLowerCase();
        return kws.some(k => txt.includes(k));
      });
    }
    if (skillTags.length > 0) {
      jobs = jobs.filter(j => {
        const txt = `${j.title} ${j.description} ${(Array.isArray(j.tags)?j.tags:[]).join(' ')}`.toLowerCase();
        return skillTags.every(s => txt.includes(s.toLowerCase()));
      });
    }
    if (jobType) jobs = jobs.filter(j => j.type === jobType);
    if (experience) jobs = jobs.filter(j => j.experience === experience);
    if (salaryMin > 0) jobs = jobs.filter(j => (j.salary_min||0) >= salaryMin);
    if (sortBy === 'salary') jobs.sort((a,b) => (b.salary_max||0)-(a.salary_max||0));
    else jobs.sort((a,b) => (b.id||0)-(a.id||0));
    return jobs;
  }, [contextJobs, query, industry, skillTags, jobType, experience, salaryMin, sortBy]);

  const clearAll = () => { setQuery(''); setIndustry('All Industries'); setJobType(''); setExp(''); setSalary(0); setSkillTags([]); setSkillIn(''); };

  const labelStyle = { fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: 8 };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        Browse <span style={{ color: 'var(--teal)' }}>Jobs</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 13 }}>
        {filtered.length} role{filtered.length !== 1 ? 's' : ''} found
      </p>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <aside className="glass-card" style={{ width: 264, padding: 22, flexShrink: 0, position: 'sticky', top: 76 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 20, fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>🔍 Filters</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Search</label>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Title, company, skill…" style={{ fontSize: 13 }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Skills You Have <span style={{ textTransform: 'none', letterSpacing: 0 }}>(Enter to add)</span></label>
            <input value={skillInput} onChange={e => setSkillIn(e.target.value)} onKeyDown={addSkill}
              placeholder="e.g. React, Python…" style={{ fontSize: 13, marginBottom: skillTags.length ? 8 : 0 }} />
            {skillTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {skillTags.map(s => (
                  <span key={s} onClick={() => setSkillTags(p => p.filter(t => t !== s))}
                    className="skill-chip" style={{ cursor: 'pointer', fontSize: 11 }}>
                    {s} ✕
                  </span>
                ))}
              </div>
            )}
            {skillTags.length > 0 && <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>Showing jobs matching all your skills</p>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ fontSize: 13 }}>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Job Type</label>
            <select value={jobType} onChange={e => setJobType(e.target.value)} style={{ fontSize: 13 }}>
              <option value="">All Types</option>
              <option>Full-time</option><option>Part-time</option><option>Contract</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Experience Level</label>
            <select value={experience} onChange={e => setExp(e.target.value)} style={{ fontSize: 13 }}>
              <option value="">All Levels</option>
              <option>Junior</option><option>Mid-level</option><option>Senior</option>
            </select>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Min Salary: <span style={{ color: 'var(--teal)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>${(salaryMin/1000).toFixed(0)}k</span></label>
            <input type="range" min={0} max={150000} step={10000} value={salaryMin} onChange={e => setSalary(+e.target.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', padding: 0, accentColor: 'var(--teal)' }} />
          </div>

          <button onClick={clearAll} className="btn-ghost" style={{ width: '100%', padding: '9px', cursor: 'pointer', fontSize: 13 }}>
            Clear All Filters
          </button>
        </aside>

        {/* Job list */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Sort bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint)', alignSelf: 'center' }}>Sort:</span>
            {[['recent','Most Recent'],['salary','Highest Salary']].map(([val, label]) => (
              <button key={val} onClick={() => setSort(val)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
                background: sortBy === val ? 'rgba(45,212,164,0.12)' : 'rgba(255,255,255,0.05)',
                border: sortBy === val ? '1px solid rgba(45,212,164,0.35)' : '1px solid rgba(255,255,255,0.1)',
                color: sortBy === val ? 'var(--teal)' : 'var(--text-muted)',
              }}>{label}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14 }}>No jobs match your current filters.</p>
              <button onClick={clearAll} className="btn-teal" style={{ padding: '10px 24px', cursor: 'pointer', fontSize: 13 }}>Clear Filters</button>
            </div>
          ) : (
            filtered.map(job => <JobCard key={job.id} job={job} />)
          )}
        </main>
      </div>
    </div>
  );
}
