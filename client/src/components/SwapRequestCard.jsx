// src/components/SwapRequestCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending:   { bg: 'rgba(200,133,58,0.12)',  color: '#9A6020', label: 'Pending' },
  accepted:  { bg: 'rgba(107,143,113,0.15)', color: '#4A7A52', label: 'Accepted' },
  rejected:  { bg: 'rgba(192,68,42,0.10)',   color: '#9A3820', label: 'Rejected' },
  completed: { bg: 'rgba(74,124,160,0.12)',  color: '#3A7A9A', label: 'Completed' },
  cancelled: { bg: 'rgba(90,80,72,0.10)',    color: '#5A5048', label: 'Cancelled' },
};

export default function SwapRequestCard({ swap, type, onUpdate }) {
  const [loading, setLoading] = useState(null); // 'accept'|'reject'|'complete'|'cancel'
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');

  const status = STATUS_STYLES[swap.status] || STATUS_STYLES.pending;
  const other = type === 'incoming' ? swap.requester : swap.owner;

  const act = async (action, extraData = {}) => {
    setLoading(action);
    try {
      const { data } = await api.put(`/swaps/${swap._id}/${action}`, extraData);
      toast.success(
        action === 'accept' ? 'Swap accepted! 🎉' :
        action === 'reject' ? 'Swap rejected.' :
        action === 'complete' ? 'Swap completed! ✅' : 'Request cancelled.'
      );
      onUpdate?.(data.swap);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setLoading(null);
    }
  };

  const sendChatMessage = async () => {
    if (!message.trim()) return;
    try {
      await api.post('/messages', {
        receiverId: other._id,
        content: message,
        swapRequestId: swap._id,
      });
      toast.success('Message sent!');
      setMessage('');
      setShowChat(false);
    } catch {
      toast.error('Failed to send message.');
    }
  };

  return (
    <div style={{
      background: 'var(--cream)',
      border: '1px solid var(--parchment)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'box-shadow 0.2s',
      animation: 'fadeInUp 0.4s var(--ease-out) both',
    }}
      onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Other user avatar */}
          <Link to={`/profile/${other?._id}`}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '1rem',
              overflow: 'hidden', border: '2px solid var(--parchment)',
            }}>
              {other?.avatar
                ? <img src={other.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : other?.name?.[0]?.toUpperCase()
              }
            </div>
          </Link>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>{other?.name}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              {type === 'incoming' ? 'wants your book' : 'you requested from'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: status.bg, color: status.color,
          }}>
            {status.label}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>
            {new Date(swap.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Books */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Requested book */}
        <div style={{ flex: 1, minWidth: 140, padding: '12px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Requested</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 44, height: 60, borderRadius: 4, background: 'var(--amber)', flexShrink: 0, overflow: 'hidden' }}>
              {swap.requestedBook?.image
                ? <img src={swap.requestedBook.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>📖</div>
              }
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3, color: 'var(--ink)' }}>
                {swap.requestedBook?.title}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{swap.requestedBook?.author}</p>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 28, color: 'var(--amber)', fontSize: '1.2rem' }}>⇄</div>

        {/* Offered book */}
        {swap.offeredBook ? (
          <div style={{ flex: 1, minWidth: 140, padding: '12px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Offered</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 44, height: 60, borderRadius: 4, background: 'var(--sage-light)', flexShrink: 0, overflow: 'hidden' }}>
                {swap.offeredBook?.image
                  ? <img src={swap.offeredBook.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>📗</div>
                }
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3, color: 'var(--ink)' }}>
                  {swap.offeredBook?.title}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{swap.offeredBook?.author}</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 140, padding: '12px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-faint)' }}>No book offered</span>
          </div>
        )}
      </div>

      {/* Message */}
      {swap.message && (
        <div style={{ background: 'rgba(200,133,58,0.06)', borderLeft: '3px solid var(--amber)', padding: '10px 14px', borderRadius: '0 8px 8px 0' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', fontStyle: 'italic' }}>"{swap.message}"</p>
        </div>
      )}

      {/* Meeting point (if accepted) */}
      {swap.meetingPoint && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.9rem' }}>📍</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>Meeting at: <strong>{swap.meetingPoint}</strong></span>
        </div>
      )}

      {/* Actions */}
      {swap.status === 'pending' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {type === 'incoming' && (
            <>
              {/* Accept with optional meeting point */}
              <div style={{ display: 'flex', flex: 1, gap: 8, minWidth: 240 }}>
                <input
                  className="form-input"
                  placeholder="Meeting point (optional)"
                  value={meetingPoint}
                  onChange={e => setMeetingPoint(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                />
                <button
                  onClick={() => act('accept', { meetingPoint })}
                  disabled={!!loading}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.82rem', flexShrink: 0 }}
                >
                  {loading === 'accept' ? '…' : '✓ Accept'}
                </button>
              </div>
              <button
                onClick={() => act('reject')}
                disabled={!!loading}
                className="btn-ghost"
                style={{ color: 'var(--rust)', fontSize: '0.82rem' }}
              >
                {loading === 'reject' ? '…' : '✕ Decline'}
              </button>
            </>
          )}
          {type === 'outgoing' && (
            <button
              onClick={() => act('cancel')}
              disabled={!!loading}
              className="btn-ghost"
              style={{ color: 'var(--rust)', fontSize: '0.82rem' }}
            >
              {loading === 'cancel' ? '…' : 'Cancel request'}
            </button>
          )}
        </div>
      )}

      {swap.status === 'accepted' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => act('complete')}
            disabled={!!loading}
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 16px' }}
          >
            {loading === 'complete' ? '…' : '✅ Mark Completed'}
          </button>
          <button onClick={() => setShowChat(!showChat)} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
            💬 Message
          </button>
        </div>
      )}

      {/* Inline chat */}
      {showChat && (
        <div style={{ display: 'flex', gap: 8, animation: 'fadeIn 0.2s ease' }}>
          <input
            className="form-input"
            placeholder={`Message ${other?.name}…`}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
            style={{ flex: 1, fontSize: '0.85rem' }}
          />
          <button onClick={sendChatMessage} className="btn-primary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}
