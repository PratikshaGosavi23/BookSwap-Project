// src/pages/SignupPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const INTERESTS_OPTIONS = [
  'Fiction','Fantasy','Science Fiction','Mystery','Thriller',
  'Romance','Biography','Self-Help','History','Science','Technology','Philosophy',
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [interests, setInterests] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep]         = useState(1); // 2-step form

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleInterest = (cat) => {
    setInterests(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required.');
    if (!form.email.trim()) return toast.error('Email is required.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    setStep(2);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await signup({ name: form.name, email: form.email, password: form.password, interests });
      toast.success(data.message || 'Welcome to BookSwap! 📚');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream)',
      padding: '80px 24px 40px',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,143,113,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '5%', right: '8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,133,58,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeInUp 0.5s var(--ease-out) both' }}>
        {/* Logo + header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}>
            📚 Book<span style={{ color: 'var(--amber)' }}>Swap</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--ink)', marginTop: 24, marginBottom: 6 }}>
            {step === 1 ? 'Create your account' : 'What do you love reading?'}
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
            {step === 1 ? 'Join thousands of readers on BookSwap' : 'Pick your interests — we\'ll personalize your feed'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: s <= step ? 'var(--amber)' : 'var(--parchment)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        <div style={{
          background: 'var(--cream)',
          border: '1px solid var(--parchment)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          boxShadow: 'var(--shadow-md)',
        }}>
          {step === 1 ? (
            <form onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input type="text" name="name" value={form.name} onChange={onChange}
                  className="form-input" placeholder="Arjun Sharma" required autoComplete="name" />
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <input type="email" name="email" value={form.email} onChange={onChange}
                  className="form-input" placeholder="you@example.com" required autoComplete="email" />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={onChange}
                    className="form-input" placeholder="At least 6 characters" required style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--ink-faint)' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm password</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange}
                  className="form-input" placeholder="Repeat your password" required />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}>
                Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {INTERESTS_OPTIONS.map(cat => {
                  const selected = interests.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      style={{
                        padding: '9px 18px',
                        borderRadius: 'var(--radius-full)',
                        border: `1.5px solid ${selected ? 'var(--amber)' : 'var(--parchment)'}`,
                        background: selected ? 'rgba(200,133,58,0.12)' : 'transparent',
                        color: selected ? 'var(--amber-dark)' : 'var(--ink-muted)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        fontWeight: selected ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {selected ? '✓ ' : ''}{cat}
                    </button>
                  );
                })}
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', textAlign: 'center' }}>
                {interests.length === 0 ? 'Select at least one (optional)' : `${interests.length} selected`}
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: '0 0 auto', padding: '13px 20px' }}>
                  ← Back
                </button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
                  {loading ? 'Creating account…' : '🎉 Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--amber)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
