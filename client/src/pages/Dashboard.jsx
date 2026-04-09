// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import BookCard from '../components/BookCard';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color, link }) => (
  <Link to={link || '#'} style={{ textDecoration: 'none' }}>
    <div style={{
      background: 'var(--cream)',
      border: '1px solid var(--parchment)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      transition: 'all 0.25s ease',
      cursor: 'pointer',
    }}
      onMouseOver={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 6px 20px ${color}30`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--parchment)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: 3 }}>{label}</p>
      </div>
    </div>
  </Link>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [myBooks,          setMyBooks]          = useState([]);
  const [recommendations,  setRecommendations]  = useState([]);
  const [stats,            setStats]            = useState({ pending: 0, accepted: 0, completed: 0 });
  const [loading,          setLoading]          = useState(true);
  const [recsLoading,      setRecsLoading]      = useState(true);
  const [hybridRecs,       setHybridRecs]       = useState([]);
  const [hybridLoading,    setHybridLoading]    = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [booksRes, statsRes] = await Promise.all([
          api.get('/books/my-books'),
          api.get('/swaps/stats'),
        ]);
        setMyBooks(booksRes.data.books.slice(0, 4));
        setStats(statsRes.data.stats);
      } catch (err) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchRecs = async () => {
      try {
        const { data } = await api.get('/ai/recommendations?limit=6');
        setRecommendations(data.recommendations);
      } catch {
        // Silently fail — AI recs are bonus
      } finally {
        setRecsLoading(false);
      }
    };
    // ── NEW: Hybrid Gemini recommendations ──
    const fetchHybridRecs = async () => {
      try {
        const { data } = await api.get('/ai/hybrid-recommendations');
        setHybridRecs(data.recommendations || []);
      } catch {
        // Silently fail — bonus feature
      } finally {
        setHybridLoading(false);
      }
    };

    fetchAll();
    fetchRecs();
    fetchHybridRecs();
  }, []);

  const onBookDelete = (id) => setMyBooks(prev => prev.filter(b => b._id !== id));

  if (loading) return <Loader fullScreen />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-wrapper" style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ animation: 'fadeInUp 0.4s var(--ease-out) both' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 4 }}>{greeting} 👋</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--ink)' }}>
              {user?.name?.split(' ')[0]}'s Library
            </h1>
            {user?.location && (
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-faint)', marginTop: 4 }}>📍 {user.location}</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/add-book" className="btn-primary">+ List a Book</Link>
            <Link to="/books"    className="btn-secondary">Browse</Link>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 48, animation: 'fadeInUp 0.5s var(--ease-out) 0.1s both' }}>
          <StatCard icon="📚" label="Books Listed"      value={myBooks.length || 0}    color="#C8853A" link="/profile" />
          <StatCard icon="⏳" label="Pending Swaps"     value={stats.pending}           color="#D4924A" link="/swaps" />
          <StatCard icon="🤝" label="Active Swaps"      value={stats.accepted}          color="#6B8F71" link="/swaps" />
          <StatCard icon="✅" label="Completed Swaps"   value={stats.completed}         color="#4A7CA0" link="/swaps" />
        </div>
        
        {/* ── Gemini Hybrid Recommendations ────────────────── */}
        {(hybridRecs.length > 0 || hybridLoading) && (
          <section style={{ marginBottom: 40, animation: 'fadeInUp 0.5s var(--ease-out) 0.15s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #4285F4, #EA4335)',
                    borderRadius: 8,
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                  }}>
                    GEMINI
                  </span>
                  Picked Just For You
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: 4 }}>
                  AI-ranked from books that match your taste
                </p>
              </div>
            </div>

            {hybridLoading ? (
              <div style={{ display: 'flex', gap: 12 }}>
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 80, flex: 1, borderRadius: 'var(--radius-md)' }} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {hybridRecs.map((rec, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '14px 18px',
                    background: 'var(--cream-dark)',
                    border: '1px solid var(--parchment)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s ease',
                  }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = 'var(--amber)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'var(--parchment)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Rank number */}
                    <div style={{
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: i === 0 ? 'var(--amber)' : 'var(--parchment)',
                      color: i === 0 ? 'white' : 'var(--ink-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>

                    {/* Book info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {rec.title}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        {rec.author}
                      </p>
                    </div>

                    {/* Reason */}
                    <p style={{
                      fontSize: '0.78rem',
                      color: 'var(--ink-muted)',
                      fontStyle: 'italic',
                      maxWidth: 280,
                      textAlign: 'right',
                      flexShrink: 0,
                    }}>
                      {rec.reason}
                    </p>

                    {/* Gemini badge */}
                    {rec.geminiEnhanced && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700,
                        padding: '2px 8px', borderRadius: 20,
                        background: 'rgba(66,133,244,0.12)',
                        color: '#4285F4',
                        flexShrink: 0,
                      }}>
                        ✦ AI
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        
        {/* ── AI Recommendations ─────────────────────────────── */}
        <section style={{ marginBottom: 56, animation: 'fadeInUp 0.5s var(--ease-out) 0.2s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: 'var(--amber)', borderRadius: 8, padding: '2px 8px', fontSize: '0.8rem', color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700 }}>AI</span>
                Recommended for You
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: 4 }}>
                Curated based on your interests: {user?.interests?.join(', ') || 'general reading'}
              </p>
            </div>
            <Link to="/books" style={{ fontSize: '0.85rem', color: 'var(--amber)', fontWeight: 500, textDecoration: 'none' }}>
              View all →
            </Link>
          </div>

          {recsLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {recommendations.map((book, i) => (
                <div key={book._id} style={{ position: 'relative' }}>
                  <BookCard book={book} />
                  {book.reason && (
                    <div style={{
                      position: 'absolute', top: 8, left: 8, right: 8,
                      background: 'rgba(28,20,16,0.75)',
                      backdropFilter: 'blur(8px)',
                      color: 'white',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 500,
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}>
                      ✨ {book.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--parchment)',
            }}>
              <p style={{ fontSize: '2rem', marginBottom: 12 }}>🤖</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 8 }}>
                No recommendations yet
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 20 }}>
                Add books to your profile or update your interests to get personalized picks.
              </p>
              <Link to="/profile" className="btn-primary" style={{ fontSize: '0.875rem' }}>Update Interests</Link>
            </div>
          )}
        </section>

        {/* ── My Books ───────────────────────────────────────── */}
        <section style={{ animation: 'fadeInUp 0.5s var(--ease-out) 0.3s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)' }}>
              My Books
            </h2>
            <Link to="/add-book" style={{ fontSize: '0.85rem', color: 'var(--amber)', fontWeight: 500, textDecoration: 'none' }}>
              + Add more →
            </Link>
          </div>

          {myBooks.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {myBooks.map(book => (
                <BookCard key={book._id} book={book} showActions onDelete={onBookDelete} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--parchment)',
            }}>
              <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>📚</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 8 }}>
                Your shelf is empty
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 20 }}>
                List your first book and start exchanging with readers near you.
              </p>
              <Link to="/add-book" className="btn-primary">Add Your First Book →</Link>
            </div>
          )}
        </section>

        {/* ── Quick Links ────────────────────────────────────── */}
        <section style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, animation: 'fadeInUp 0.5s var(--ease-out) 0.4s both' }}>
          {[
            { to: '/swaps',   icon: '🔄', label: 'Manage Swaps', desc: 'Accept or reject incoming requests' },
            { to: '/books',   icon: '🔍', label: 'Browse Books', desc: 'Discover books from other readers' },
            { to: '/profile', icon: '👤', label: 'Edit Profile', desc: 'Update your bio and interests' },
          ].map(({ to, icon, label, desc }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--cream-dark)',
                border: '1px solid var(--parchment)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'all 0.2s ease',
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--parchment)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: '1.6rem' }}>{icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>{label}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

      </div>
    </div>
  );
}
