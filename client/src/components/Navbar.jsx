// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="4" y="4" width="14" height="20" rx="2" fill="var(--amber)" opacity="0.9"/>
    <rect x="8" y="4" width="14" height="20" rx="2" fill="var(--amber-dark)" opacity="0.7"/>
    <line x1="10" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="10" y1="14" x2="18" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="10" y1="18" x2="14" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function Navbar() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    background: scrolled ? 'var(--glass-bg)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--glass-border)' : 'none',
    boxShadow: scrolled ? '0 4px 24px rgba(28,20,16,0.06)' : 'none',
  };

  const linkStyle = (path) => ({
    fontSize: '1.4rem',
    fontWeight: 500,
    color: isActive(path) ? 'var(--amber)' : 'var(--ink-soft)',
    padding: '6px 4px',
    borderBottom: isActive(path) ? '2px solid var(--amber)' : '2px solid transparent',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  });

  return (
    <nav style={navStyle}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <BookIcon />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            Book<span style={{ color: 'var(--amber)' }}>Swap</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          <Link to="/books" style={linkStyle('/books')}>Browse</Link>
          {user && (
            <>
              <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
              <Link to="/swaps"     style={linkStyle('/swaps')}>My Swaps</Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              border: '1.5px solid var(--parchment)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-muted)',
              fontSize: '1.3rem',
              transition: 'all 0.2s',
            }}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/add-book" className="btn-primary" style={{ padding: '9px 20px', fontSize: '1.3rem' }}>
                + Add Book
              </Link>
              <div style={{ position: 'relative' }}>
                <Link to="/profile">
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: user.avatar ? 'transparent' : 'var(--amber)',
                    border: '2px solid var(--amber)',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : user.name?.[0]?.toUpperCase()
                    }
                  </div>
                </Link>
              </div>
              <button onClick={handleLogout} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login"  className="btn-secondary" style={{ padding: '9px 20px', fontSize: '0.875rem' }}>Log in</Link>
              <Link to="/signup" className="btn-primary"   style={{ padding: '9px 20px', fontSize: '0.875rem' }}>Sign up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              width: 36, height: 36,
              border: '1.5px solid var(--parchment)',
              borderRadius: 8,
              background: 'transparent',
              cursor: 'pointer',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 18, height: 2, background: 'var(--ink)', borderRadius: 1, display: 'block' }} />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '72px', left: 0, right: 0,
          background: 'var(--cream)',
          borderBottom: '1px solid var(--parchment)',
          padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 16,
          boxShadow: '0 8px 24px rgba(28,20,16,0.08)',
        }}>
          <Link to="/books"     style={linkStyle('/books')}>Browse Books</Link>
          {user && <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>}
          {user && <Link to="/swaps"     style={linkStyle('/swaps')}>My Swaps</Link>}
          {user && <Link to="/add-book"  style={linkStyle('/add-book')}>+ Add Book</Link>}
          {user && <Link to="/profile"   style={linkStyle('/profile')}>Profile</Link>}
          {user
            ? <button onClick={handleLogout} style={{ textAlign: 'left', ...linkStyle('/'), border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rust)' }}>Sign out</button>
            : <Link to="/login" style={linkStyle('/login')}>Log in</Link>
          }
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
