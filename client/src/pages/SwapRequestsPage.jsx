// src/pages/SwapRequestsPage.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import SwapRequestCard from '../components/SwapRequestCard';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'incoming', label: '📥 Incoming', desc: 'Requests for your books' },
  { key: 'outgoing', label: '📤 Outgoing', desc: 'Your swap requests' },
];

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'];

export default function SwapRequestsPage() {
  const [tab,            setTab]            = useState('incoming');
  const [swaps,          setSwaps]          = useState({ incoming: [], outgoing: [] });
  const [loading,        setLoading]        = useState(true);
  const [statusFilter,   setStatusFilter]   = useState('all');

  useEffect(() => {
    const fetchSwaps = async () => {
      setLoading(true);
      try {
        const [incRes, outRes] = await Promise.all([
          api.get('/swaps/incoming'),
          api.get('/swaps/outgoing'),
        ]);
        setSwaps({
          incoming: incRes.data.swaps,
          outgoing: outRes.data.swaps,
        });
      } catch {
        toast.error('Failed to load swap requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchSwaps();
  }, []);

  const onUpdate = (updatedSwap) => {
    setSwaps(prev => ({
      incoming: prev.incoming.map(s => s._id === updatedSwap._id ? updatedSwap : s),
      outgoing: prev.outgoing.map(s => s._id === updatedSwap._id ? updatedSwap : s),
    }));
  };

  const currentSwaps = swaps[tab];
  const filtered     = statusFilter === 'all'
    ? currentSwaps
    : currentSwaps.filter(s => s.status === statusFilter);

  const countByStatus = (status) =>
    currentSwaps.filter(s => s.status === status).length;

  if (loading) return <Loader fullScreen />;

  return (
    <div className="page-wrapper" style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 36, animation: 'fadeInUp 0.4s var(--ease-out) both' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', color: 'var(--ink)', marginBottom: 8 }}>
            Swap Requests
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.92rem' }}>
            Manage all your book exchange requests in one place.
          </p>
        </div>

        {/* ── Summary stats ──────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 28,
          flexWrap: 'wrap',
          animation: 'fadeInUp 0.4s var(--ease-out) 0.1s both',
        }}>
          {[
            { label: 'Pending',   count: countByStatus('pending'),   color: '#C8853A', bg: 'rgba(200,133,58,0.10)' },
            { label: 'Accepted',  count: countByStatus('accepted'),  color: '#6B8F71', bg: 'rgba(107,143,113,0.10)' },
            { label: 'Completed', count: countByStatus('completed'), color: '#4A7CA0', bg: 'rgba(74,124,160,0.10)' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 18px',
              background: bg,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }} onClick={() => setStatusFilter(label.toLowerCase())}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color }}>{count}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Tab switcher ───────────────────────────────────── */}
        <div style={{
          display: 'flex',
          background: 'var(--cream-dark)',
          borderRadius: 'var(--radius-lg)',
          padding: 4,
          marginBottom: 24,
          border: '1px solid var(--parchment)',
          animation: 'fadeInUp 0.4s var(--ease-out) 0.15s both',
        }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setStatusFilter('all'); }}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 10,
                border: 'none',
                background: tab === t.key ? 'var(--cream)' : 'transparent',
                boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? 'var(--ink)' : 'var(--ink-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <span>{t.label} ({swaps[t.key].length})</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--ink-faint)' }}>{t.desc}</span>
            </button>
          ))}
        </div>

        {/* ── Status filter pills ─────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, animation: 'fadeInUp 0.4s var(--ease-out) 0.2s both' }}>
          {STATUS_FILTERS.map(sf => (
            <button
              key={sf}
              onClick={() => setStatusFilter(sf)}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${statusFilter === sf ? 'var(--amber)' : 'var(--parchment)'}`,
                background: statusFilter === sf ? 'rgba(200,133,58,0.12)' : 'transparent',
                color: statusFilter === sf ? 'var(--amber-dark)' : 'var(--ink-muted)',
                fontSize: '0.8rem',
                fontWeight: statusFilter === sf ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {sf === 'all' ? `All (${currentSwaps.length})` : `${sf} (${countByStatus(sf)})`}
            </button>
          ))}
        </div>

        {/* ── Swap list ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeInUp 0.4s var(--ease-out) 0.25s both' }}>
          {filtered.length > 0 ? (
            filtered.map(swap => (
              <SwapRequestCard
                key={swap._id}
                swap={swap}
                type={tab}
                onUpdate={onUpdate}
              />
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '80px 24px',
              background: 'var(--cream-dark)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--parchment)',
            }}>
              <p style={{ fontSize: '3rem', marginBottom: 16 }}>
                {tab === 'incoming' ? '📥' : '📤'}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 8 }}>
                {statusFilter !== 'all'
                  ? `No ${statusFilter} requests`
                  : tab === 'incoming'
                    ? 'No incoming requests yet'
                    : 'You haven\'t sent any swap requests yet'}
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
                {tab === 'incoming'
                  ? 'When readers request your books, they\'ll show up here.'
                  : 'Browse the book listings and request a swap!'}
              </p>
              {tab === 'outgoing' && (
                <a href="/books" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
                  Browse Books →
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── How it works ───────────────────────────────────── */}
        {currentSwaps.length === 0 && (
          <div style={{ marginTop: 48, padding: '32px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--parchment)', animation: 'fadeInUp 0.5s var(--ease-out) 0.3s both' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 20, textAlign: 'center' }}>
              How Book Swapping Works
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {[
                { step: '1', icon: '📚', text: 'List books you want to give away' },
                { step: '2', icon: '🔍', text: 'Browse and find books you want' },
                { step: '3', icon: '📤', text: 'Send a swap request with a message' },
                { step: '4', icon: '🤝', text: 'Owner accepts & you arrange meetup' },
              ].map(({ step, icon, text }) => (
                <div key={step} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--amber)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 700, margin: '0 auto 10px',
                  }}>{step}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>{icon} {text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
