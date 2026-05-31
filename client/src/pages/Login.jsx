import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Login() {
  const [role, setRole]       = useState('seeker');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [showPass, setShow]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const result = await login(email, password, role);
    setLoading(false);
    if (result.success) navigate(result.user.role === 'employer' ? '/employer' : '/dashboard');
    else setErrors({ api: result.error || 'Login failed. Check your credentials.' });
  };

  const labelStyle = { fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: 8 };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#7C6FE0,#2DD4A4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(124,111,224,0.4)' }}>💼</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to continue your job search</p>
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          {/* Role toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {[['seeker','👤 Job Seeker'],['employer','🏢 Employer']].map(([val, label]) => (
              <button key={val} onClick={() => setRole(val)} style={{
                flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s', fontFamily: 'var(--font-body)',
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
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(v=>({...v,email:'',api:''})); }}
                placeholder="you@example.com" style={{ borderColor: errors.email ? '#f87171' : '' }} />
              {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{errors.email}</p>}
            </div>
            <div style={{ marginBottom: 26 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => { setPass(e.target.value); setErrors(v=>({...v,password:'',api:''})); }}
                  placeholder="••••••••" style={{ paddingRight: 48, borderColor: errors.password ? '#f87171' : '' }} />
                <button type="button" onClick={() => setShow(v=>!v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 16 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{errors.password}</p>}
            </div>
            <button type="submit" className="btn-teal" style={{ width: '100%', padding: '13px', fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--text-faint)' }}>
            No account? Register first with any email + password (6+ chars)
          </p>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
