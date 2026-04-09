// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(data.message || 'Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: 'arjun@bookswap.com', password: 'password123' });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '80px 24px 40px' }}>
      {/* Decorative */}
      <div style={{ position: 'fixed', top: '15%', right: '8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,133,58,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '5%',  width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeInUp 0.5s var(--ease-out) both' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}>
            📚 Book<span style={{ color: 'var(--amber)' }}>Swap</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--ink)', marginTop: 24, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.92rem' }}>Sign in to continue your reading journey</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--cream)', border: '1px solid var(--parchment)', borderRadius: 'var(--radius-xl)', padding: '36px', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email" name="email" value={form.email} onChange={onChange}
                className="form-input" placeholder="you@example.com" required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password} onChange={onChange}
                  className="form-input" placeholder="Your password" required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', fontSize: '1rem' }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.98rem', marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          {/* Demo */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={fillDemo} className="btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--amber)' }}>
              Use demo account
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--amber)', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
