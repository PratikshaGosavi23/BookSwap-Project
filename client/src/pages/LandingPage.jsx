// src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const FEATURES = [
  { icon: '📚', title: 'List Your Books', desc: 'Add books you own and want to exchange with a few taps.' },
  { icon: '🔄', title: 'Request Swaps',   desc: 'Found a book you love? Request a swap directly from the owner.' },
  { icon: '🤖', title: 'AI Recommendations', desc: 'Our engine learns your taste and surfaces books you\'ll love.' },
  { icon: '💬', title: 'Chat & Connect', desc: 'Message other readers, arrange meetups, build your community.' },
];

const CATEGORIES = ['Fiction','Fantasy','Science Fiction','Mystery','Thriller','Self-Help','History','Technology','Romance','Biography'];

const BG_BOOKS = ['📗','📘','📙','📕','📓','📔'];

export default function LandingPage() {
  const [stats, setStats] = useState({ books: 0, users: 0, swaps: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    // Fetch real stats (graceful fallback)
    api.get('/books?limit=1')
      .then(({ data }) => setStats(s => ({ ...s, books: data.pagination?.total || 120 })))
      .catch(() => setStats({ books: 120, users: 340, swaps: 89 }));
  }, []);

  // Parallax on hero
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        background: 'var(--cream)',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-8%',
          width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,133,58,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '0%', left: '-5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,143,113,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Floating book emojis */}
        {BG_BOOKS.map((b, i) => (
          <span key={i} style={{
            position: 'absolute',
            fontSize: `${1.5 + (i % 3) * 0.6}rem`,
            opacity: 0.12 + (i % 4) * 0.04,
            top:  `${15 + (i * 13) % 65}%`,
            left: `${5  + (i * 17) % 88}%`,
            transform: `rotate(${-15 + i * 8}deg)`,
            animation: `pulse ${3 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            userSelect: 'none',
          }}>{b}</span>
        ))}

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', padding: '120px 24px 80px' }}>
          {/* Left: Text */}
          <div style={{ animation: 'fadeInUp 0.7s var(--ease-out) both' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(200,133,58,0.1)',
              border: '1px solid rgba(200,133,58,0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px', marginBottom: 24,
              fontSize: '0.8rem', fontWeight: 600, color: 'var(--amber-dark)',
              letterSpacing: '0.03em',
            }}>
              <span style={{ animation: 'spin 3s linear infinite', display: 'inline-block' }}>✦</span>
              AI-Powered Book Exchange
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
              fontWeight: 700,
              lineHeight: 1.12,
              color: 'var(--ink)',
              marginBottom: 24,
            }}>
              Your next favourite<br />
              book is just{' '}
              <span style={{
                color: 'var(--amber)',
                position: 'relative',
                display: 'inline-block',
              }}>
                a swap away.
                <svg style={{ position: 'absolute', bottom: -6, left: 0, width: '100%' }} height="8" viewBox="0 0 200 8">
                  <path d="M0 6 Q50 0 100 6 Q150 12 200 6" stroke="var(--amber)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'var(--ink-muted)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Join a community of readers who exchange books they've loved for ones they'll adore. Powered by AI recommendations that truly know your taste.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                Start Swapping Free →
              </Link>
              <Link to="/books" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                Browse Books
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
              {[
                { n: stats.books || '120+', label: 'Books listed' },
                { n: '340+', label: 'Readers' },
                { n: '89+', label: 'Swaps done' },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)' }}>{n}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual stack */}
          <div ref={heroRef} style={{ position: 'relative', height: 420, animation: 'fadeIn 0.9s ease both', animationDelay: '0.2s' }}>
            {[
              { top: '5%',  left: '15%', rotate: '-8deg', color: '#C8853A', emoji: '📗', title: 'Dune', author: 'Frank Herbert' },
              { top: '20%', left: '35%', rotate: '3deg',  color: '#6B8F71', emoji: '📘', title: 'Sapiens', author: 'Y.N. Harari' },
              { top: '45%', left: '5%',  rotate: '-4deg', color: '#7A6A5A', emoji: '📙', title: 'Atomic Habits', author: 'James Clear' },
              { top: '50%', left: '48%', rotate: '6deg',  color: '#4A7CA0', emoji: '📕', title: 'The Alchemist', author: 'Paulo Coelho' },
            ].map((card, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: card.top, left: card.left,
                width: 150, padding: '14px',
                background: 'var(--cream)',
                border: '1px solid var(--parchment)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                transform: `rotate(${card.rotate})`,
                transition: 'transform 0.3s ease',
                animation: `fadeInUp 0.6s var(--ease-out) both`,
                animationDelay: `${i * 0.12 + 0.3}s`,
              }}
                onMouseOver={e => e.currentTarget.style.transform = `rotate(0deg) scale(1.04)`}
                onMouseOut={e => e.currentTarget.style.transform = `rotate(${card.rotate})`}
              >
                <div style={{ width: '100%', height: 90, background: card.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: 10 }}>
                  {card.emoji}
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{card.title}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', marginTop: 2 }}>{card.author}</p>
              </div>
            ))}

            {/* AI badge floating */}
            <div style={{
              position: 'absolute', bottom: '8%', right: '2%',
              background: 'var(--amber)',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 18px',
              boxShadow: 'var(--shadow-amber)',
              animation: 'fadeInUp 0.7s var(--ease-out) 0.6s both',
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.85 }}>AI Recommended</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700 }}>For you ✨</p>
            </div>
          </div>
        </div>

        {/* Mobile: collapse to single column */}
        <style>{`
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; }
            .hero-visual { display: none !important; }
          }
        `}</style>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', background: 'var(--cream-dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: 'var(--ink)' }}>
              Everything you need to<br />build your reading life.
            </h2>
            <p style={{ color: 'var(--ink-muted)', marginTop: 12, fontSize: '1rem', maxWidth: 480, margin: '12px auto 0' }}>
              BookSwap gives you the tools to discover, exchange, and enjoy books — all in one beautiful place.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'var(--cream)',
                border: '1px solid var(--parchment)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 24px',
                transition: 'all 0.3s ease',
              }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'var(--amber)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-amber)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--parchment)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--cream)' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: 'var(--ink)', marginBottom: 32, textAlign: 'center' }}>
            Every genre. Every taste.
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/books?category=${cat}`}
                style={{
                  padding: '10px 22px',
                  background: 'var(--cream-dark)',
                  border: '1.5px solid var(--parchment)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--ink-soft)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--amber)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'var(--cream-dark)'; e.currentTarget.style.color = 'var(--ink-soft)'; e.currentTarget.style.borderColor = 'var(--parchment)'; }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section style={{
        padding: '80px 24px',
        background: 'var(--amber)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-40%', right: '-5%',  width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'white', marginBottom: 16 }}>
            Ready to start your swap story?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
            Join thousands of readers already swapping books they love.
          </p>
          <Link to="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', color: 'var(--amber-dark)',
            padding: '14px 36px', borderRadius: 'var(--radius-full)',
            fontWeight: 700, fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 8px 32px rgba(28,20,16,0.15)',
            transition: 'transform 0.2s ease',
          }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ padding: '40px 0', background: 'var(--ink)', color: 'var(--ink-faint)', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--amber)', marginBottom: 8 }}>
            📚 BookSwap
          </p>
          <p style={{ fontSize: '0.82rem' }}>Built with ❤️ for readers everywhere </p>
        </div>
      </footer>
    </div>
  );
}
