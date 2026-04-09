// src/components/BookCard.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CONDITION_COLOR = {
  'New':       { bg: 'rgba(107,143,113,0.15)', color: '#4A7A52' },
  'Like New':  { bg: 'rgba(74,124,160,0.12)',  color: '#3A7A9A' },
  'Good':      { bg: 'rgba(200,133,58,0.12)',  color: '#9A6020' },
  'Fair':      { bg: 'rgba(192,68,42,0.10)',   color: '#9A3820' },
  'Poor':      { bg: 'rgba(90,80,72,0.10)',    color: '#5A5048' },
};

const PLACEHOLDER = (title) => {
  const colors = ['#C8853A','#6B8F71','#7A6A5A','#4A7CA0','#9D4A3A'];
  const idx = title.charCodeAt(0) % colors.length;
  return colors[idx];
};

export default function BookCard({ book, onSwapRequest, onDelete, showActions = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requesting, setRequesting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isOwner = user && book.owner?._id === user._id;
  const cond = CONDITION_COLOR[book.condition] || CONDITION_COLOR['Good'];

  const handleSwapRequest = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (isOwner) { toast.error("This is your own book!"); return; }

    setRequesting(true);
    try {
      const { data } = await api.post('/swaps', { requestedBookId: book._id });
      toast.success('Swap request sent! 🔄');
      onSwapRequest?.(data.swap);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending swap request');
    } finally {
      setRequesting(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm('Remove this book from your listings?')) return;
    try {
      await api.delete(`/books/${book._id}`);
      toast.success('Book removed.');
      onDelete?.(book._id);
    } catch {
      toast.error('Error removing book.');
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 'var(--radius-lg)',
        background: 'var(--cream)',
        border: '1px solid var(--parchment)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.25s var(--ease-out), box-shadow 0.25s ease',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeInUp 0.4s var(--ease-out) both',
      }}
      onClick={() => navigate(`/book/${book._id}`)}
    >
      {/* Cover Image */}
      <div style={{
        height: 200,
        background: book.image ? undefined : PLACEHOLDER(book.title),
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: '3rem' }}>📚</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', padding: '0 12px' }}>
              {book.title}
            </span>
          </div>
        )}

        {/* Availability badge */}
        {!book.isAvailable && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(28,20,16,0.75)',
            backdropFilter: 'blur(8px)',
            color: 'white', fontSize: '0.7rem', fontWeight: 600,
            padding: '4px 10px', borderRadius: 'var(--radius-full)',
          }}>
            Unavailable
          </div>
        )}

        {/* Category badge */}
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          background: 'rgba(250,247,242,0.88)',
          backdropFilter: 'blur(8px)',
          color: 'var(--amber-dark)', fontSize: '0.7rem', fontWeight: 600,
          padding: '3px 10px', borderRadius: 'var(--radius-full)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          {book.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'var(--ink)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {book.title}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: 2 }}>
            {book.author}
          </p>
        </div>

        {/* Condition + owner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600,
            padding: '2px 8px', borderRadius: 'var(--radius-full)',
            background: cond.bg, color: cond.color,
          }}>
            {book.condition}
          </span>

          {book.owner && (
            <Link
              to={`/profile/${book.owner._id}`}
              onClick={e => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                textDecoration: 'none',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--amber)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', color: 'white', fontWeight: 700,
                overflow: 'hidden',
              }}>
                {book.owner.avatar
                  ? <img src={book.owner.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : book.owner.name?.[0]?.toUpperCase()
                }
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                {book.owner.name?.split(' ')[0]}
              </span>
            </Link>
          )}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', gap: 8 }}>
          {showActions && isOwner ? (
            <>
              <Link
                to="/add-book"
                state={{ editBook: book }}
                onClick={e => e.stopPropagation()}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '8px 12px' }}
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="btn-ghost"
                style={{ color: 'var(--rust)', fontSize: '0.82rem' }}
              >
                🗑
              </button>
            </>
          ) : !isOwner && book.isAvailable && (
            <button
              onClick={handleSwapRequest}
              disabled={requesting}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '9px 12px' }}
            >
              {requesting ? 'Sending…' : '🔄 Request Swap'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
