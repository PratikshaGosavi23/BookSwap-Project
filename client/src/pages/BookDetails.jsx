// src/pages/BookDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CONDITION_COLOR = {
  'New':      { bg: 'rgba(107,143,113,0.15)', color: '#4A7A52' },
  'Like New': { bg: 'rgba(74,124,160,0.12)',  color: '#3A7A9A' },
  'Good':     { bg: 'rgba(200,133,58,0.12)',  color: '#9A6020' },
  'Fair':     { bg: 'rgba(192,68,42,0.10)',   color: '#9A3820' },
  'Poor':     { bg: 'rgba(90,80,72,0.10)',    color: '#5A5048' },
};

export default function BookDetails() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [book,       setBook]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/books/${id}`);
        setBook(data.book);
      } catch (err) {
        toast.error('Could not load book details.');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleSwapRequest = async () => {
    if (!user) { navigate('/login'); return; }
    setRequesting(true);
    try {
      await api.post('/swaps', { requestedBookId: book._id });
      toast.success('Swap request sent! 🔄');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending swap request.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!book)   return null;

  const isOwner = user && book.owner?._id === user._id;
  const cond    = CONDITION_COLOR[book.condition] || CONDITION_COLOR['Good'];

  return (
    <div
      className="page-wrapper"
      style={{ background: 'var(--cream)', minHeight: '100vh' }}
    >
      <div
        className="container"
        style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 900 }}
      >

        {/* ── Back button ───────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost"
          style={{ paddingLeft: 0, marginBottom: 24 }}
        >
          ← Back
        </button>

        {/* ── Main card ─────────────────────────────────────── */}
        <div
          style={{
            background:    'var(--cream)',
            border:        '1px solid var(--parchment)',
            borderRadius:  'var(--radius-xl)',
            overflow:      'hidden',
            boxShadow:     'var(--shadow-md)',
            animation:     'fadeInUp 0.4s var(--ease-out) both',
          }}
        >
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: '280px 1fr',
              gap:                 0,
            }}
          >

            {/* ── Left: Book cover ────────────────────────── */}
            <div
              style={{
                background:     book.image ? 'var(--cream-dark)' : '#C8853A',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                minHeight:      420,
                position:       'relative',
                overflow:       'hidden',
              }}
            >
              {book.image ? (
                <img
                  src={book.image}
                  alt={book.title}
                  style={{
                    width:      '100%',
                    height:     '100%',
                    objectFit:  'cover',
                    position:   'absolute',
                    inset:      0,
                  }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div
                  style={{
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    gap:            12,
                    padding:        24,
                    textAlign:      'center',
                  }}
                >
                  <span style={{ fontSize: '4rem' }}>📚</span>
                  <span
                    style={{
                      color:      'rgba(255,255,255,0.85)',
                      fontSize:   '0.9rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {book.title}
                  </span>
                </div>
              )}
            </div>

            {/* ── Right: Book details ──────────────────────── */}
            <div style={{ padding: '36px 36px 36px 36px' }}>

              {/* Category + Condition badges */}
              <div
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}
              >
                {book.category && (
                  <span
                    style={{
                      fontSize:       '0.72rem',
                      fontWeight:     600,
                      padding:        '3px 12px',
                      borderRadius:   'var(--radius-full)',
                      background:     'rgba(200,133,58,0.12)',
                      color:          'var(--amber-dark)',
                      textTransform:  'uppercase',
                      letterSpacing:  '0.04em',
                    }}
                  >
                    {book.category}
                  </span>
                )}
                {book.condition && (
                  <span
                    style={{
                      fontSize:     '0.72rem',
                      fontWeight:   600,
                      padding:      '3px 12px',
                      borderRadius: 'var(--radius-full)',
                      background:   cond.bg,
                      color:        cond.color,
                    }}
                  >
                    {book.condition}
                  </span>
                )}
                {!book.isAvailable && (
                  <span
                    style={{
                      fontSize:     '0.72rem',
                      fontWeight:   600,
                      padding:      '3px 12px',
                      borderRadius: 'var(--radius-full)',
                      background:   'rgba(90,80,72,0.10)',
                      color:        'var(--ink-muted)',
                    }}
                  >
                    Unavailable
                  </span>
                )}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily:   'var(--font-display)',
                  fontSize:     'clamp(1.4rem, 3vw, 1.9rem)',
                  color:        'var(--ink)',
                  lineHeight:   1.2,
                  marginBottom: 8,
                }}
              >
                {book.title}
              </h1>

              {/* Author */}
              <p
                style={{
                  fontSize:     '1rem',
                  color:        'var(--ink-muted)',
                  marginBottom: 24,
                }}
              >
                by <strong style={{ color: 'var(--ink-soft)' }}>{book.author}</strong>
              </p>

              {/* Description */}
              {book.description && (
                <div style={{ marginBottom: 24 }}>
                  <p
                    style={{
                      fontSize:      '0.75rem',
                      fontWeight:    600,
                      color:         'var(--ink-faint)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom:  8,
                    }}
                  >
                    About this book
                  </p>
                  <p
                    style={{
                      fontSize:   '0.92rem',
                      color:      'var(--ink-soft)',
                      lineHeight: 1.7,
                    }}
                  >
                    {book.description}
                  </p>
                </div>
              )}

              {/* Details grid */}
              <div
                style={{
                  display:             'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap:                 '12px 24px',
                  padding:             '20px',
                  background:          'var(--cream-dark)',
                  borderRadius:        'var(--radius-md)',
                  marginBottom:        24,
                  border:              '1px solid var(--parchment)',
                }}
              >
                {[
                  { label: 'Language',       value: book.language },
                  { label: 'Published Year', value: book.publishedYear },
                  { label: 'ISBN',           value: book.isbn },
                  { label: 'Views',          value: book.viewCount > 0 ? `${book.viewCount} views` : null },
                  { label: 'Listed on',      value: book.createdAt ? new Date(book.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null },
                ]
                  .filter(item => item.value)
                  .map(({ label, value }) => (
                    <div key={label}>
                      <p
                        style={{
                          fontSize:      '0.7rem',
                          color:         'var(--ink-faint)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom:  3,
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontSize:   '0.88rem',
                          color:      'var(--ink-soft)',
                          fontWeight: 500,
                        }}
                      >
                        {String(value)}
                      </p>
                    </div>
                  ))
                }
              </div>

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p
                    style={{
                      fontSize:      '0.7rem',
                      color:         'var(--ink-faint)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom:  8,
                    }}
                  >
                    Tags
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {book.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          padding:      '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          background:   'var(--cream)',
                          border:       '1px solid var(--parchment)',
                          fontSize:     '0.75rem',
                          color:        'var(--ink-muted)',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner */}
              {book.owner && (
                <div
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          12,
                    padding:      '14px 16px',
                    background:   'var(--cream-dark)',
                    borderRadius: 'var(--radius-md)',
                    border:       '1px solid var(--parchment)',
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width:          38,
                      height:         38,
                      borderRadius:   '50%',
                      background:     'var(--amber)',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      color:          'white',
                      fontWeight:     700,
                      fontSize:       '0.9rem',
                      overflow:       'hidden',
                      flexShrink:     0,
                    }}
                  >
                    {book.owner.avatar ? (
                      <img
                        src={book.owner.avatar}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      book.owner.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize:   '0.7rem',
                        color:      'var(--ink-faint)',
                        marginBottom: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Listed by
                    </p>
                    <p
                      style={{
                        fontSize:   '0.9rem',
                        fontWeight: 600,
                        color:      'var(--ink)',
                      }}
                    >
                      {book.owner.name}
                    </p>
                    {book.owner.location && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        📍 {book.owner.location}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/profile/${book.owner._id}`}
                    className="btn-ghost"
                    style={{ fontSize: '0.82rem' }}
                  >
                    View profile →
                  </Link>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {!isOwner && book.isAvailable && (
                  <button
                    onClick={handleSwapRequest}
                    disabled={requesting}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '13px' }}
                  >
                    {requesting ? 'Sending…' : '🔄 Request Swap'}
                  </button>
                )}
                {isOwner && (
                  <Link
                    to="/add-book"
                    state={{ editBook: book }}
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', padding: '13px', textAlign: 'center' }}
                  >
                    ✏️ Edit this book
                  </Link>
                )}
                <button
                  onClick={() => navigate('/books')}
                  className="btn-secondary"
                  style={{ padding: '13px 20px' }}
                >
                  Browse more
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 640px) {
          .book-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}