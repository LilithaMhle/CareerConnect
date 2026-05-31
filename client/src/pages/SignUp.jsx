import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function SignUp() {
  const [role, setRole]         = useState('seeker');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPass]     = useState('');
  const [confirmPass, setConf]  = useState('');
  const [showPass, setShow]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const { signup } = useApp();
  const navigate = useNavigate();

  const strength = () => {
    if (!password) return null;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    if (password !== confirmPass) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const result = await signup(email, password, role, name);
    setLoading(false);
    if (result.success) navigate(result.user.role === 'employer' ? '/employer' : '/dashboard');
    else setErrors({ api: result.error || 'Registration failed.' });
  };

  const s = strength();
  const strengthColors = ['#f87171','#f59e0b','#60a5fa','#4ade80'];
  const strengthLabels = ['Weak','Fair','Good','Strong'];
  const labelStyle = { fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: 8 };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#7C6FE0,#2DD4A4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(124,111,224,0.4)' }}>✦</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Join thousands finding jobs through AI matching</p>
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          {/* Role toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {[['seeker','👤 Job Seeker'],['employer','🏢 Employer']].map(([val, label]) => (
              <button key={val} onClick={() => setRole(val)} style={{
                flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                background: role === val ? 'linear-gradient(135deg,var(--teal-dark),var(--teal))' : 'transparent',
                color: role === val ? '#fff' : 'var(--text-muted)',
              }}>{label}</button>
            ))}
          </div>

          {errors.api && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, color: '#f87171', fontSize: 13 }}>
              {errors.api}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Full Name</label>
              <input value={name} onChange={e => { setName(e.target.value); setErrors(v=>({...v,name:''})); }}
                placeholder="Thabo Mokoena" style={{ borderColor: errors.name ? '#f87171' : '' }} />
              {errors.name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5 }}>{errors.name}</p>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(v=>({...v,email:''})); }}
                placeholder="you@example.com" style={{ borderColor: errors.email ? '#f87171' : '' }} />
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5 }}>{errors.email}</p>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => { setPass(e.target.value); setErrors(v=>({...v,password:''})); }}
                  placeholder="••••••••" style={{ paddingRight: 48, borderColor: errors.password ? '#f87171' : '' }} />
                <button type="button" onClick={() => setShow(v=>!v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 16 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5 }}>{errors.password}</p>}
              {s !== null && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < s ? strengthColors[s-1] : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strengthColors[s-1] || 'var(--text-faint)', marginTop: 5 }}>
                    {s > 0 ? strengthLabels[s-1] : ''} password
                  </p>
                </div>
              )}
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={confirmPass} onChange={e => { setConf(e.target.value); setErrors(v=>({...v,confirm:''})); }}
                placeholder="••••••••" style={{ borderColor: errors.confirm ? '#f87171' : '' }} />
              {errors.confirm && <p style={{ color: '#f87171', fontSize: 12, marginTop: 5 }}>{errors.confirm}</p>}
            </div>

            <button type="submit" className="btn-teal" style={{ width: '100%', padding: '13px', fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Creating account…' : `Create ${role === 'employer' ? 'Employer' : 'Seeker'} Account`}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
