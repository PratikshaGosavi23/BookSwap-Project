// src/pages/BookListings.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import Loader from '../components/Loader';

const CATEGORIES = ['All','Fiction','Non-Fiction','Science Fiction','Fantasy','Mystery','Thriller','Romance','Biography','Self-Help','History','Science','Technology','Philosophy','Children','Comics','Poetry','Other'];
const CONDITIONS = ['All','New','Like New','Good','Fair','Poor'];
const SORTS      = [
  { value: '-createdAt',  label: 'Newest First' },
  { value: 'createdAt',   label: 'Oldest First' },
  { value: '-viewCount',  label: 'Most Popular' },
  { value: 'title',       label: 'Title A–Z' },
];

export default function BookListings() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books,     setBooks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [pagination, setPag]      = useState({ total: 0, page: 1, pages: 1 });

  const [search,    setSearch]    = useState(searchParams.get('search')   || '');
  const [category,  setCategory]  = useState(searchParams.get('category') || 'All');
  const [condition, setCondition] = useState('All');
  const [sort,      setSort]      = useState('-createdAt');
  const [page,      setPage]      = useState(1);

  const searchTimer = useRef(null);

  const fetchBooks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page:      params.page      ?? page,
        limit:     12,
        sort:      params.sort      ?? sort,
        ...(params.search    ?? search    ? { search:    params.search    ?? search }    : {}),
        ...(params.category  ?? category !== 'All' ? { category: params.category ?? category } : {}),
        ...(params.condition ?? condition !== 'All' ? { condition: params.condition ?? condition } : {}),
      });
      const { data } = await api.get(`/books?${query}`);
      setBooks(data.books);
      setPag(data.pagination);

      // Track search for AI recommendations
      if (user && (params.category ?? category) !== 'All') {
        api.post('/books/track-search', { category: params.category ?? category }).catch(() => {});
      }
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, category, condition, user]);

  // Initial load + when filters change (except search — debounced)
  useEffect(() => { fetchBooks(); }, [category, condition, sort, page]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchBooks({ search, page: 1 });
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setSearchParams(e.target.value ? { search: e.target.value } : {});
  };

  const resetFilters = () => {
    setSearch(''); setCategory('All'); setCondition('All'); setSort('-createdAt'); setPage(1);
  };

  const onSwapRequest = () => fetchBooks();

  const hasFilters = search || category !== 'All' || condition !== 'All';

  return (
    <div className="page-wrapper" style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        {/* ── Page Header ──────────────────────────────────────── */}
        <div style={{ marginBottom: 32, animation: 'fadeInUp 0.4s var(--ease-out) both' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: 'var(--ink)', marginBottom: 8 }}>
            Browse Books
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
            {pagination.total > 0 ? `${pagination.total} books available for exchange` : 'Find your next great read'}
          </p>
        </div>

        {/* ── Search & Filters ─────────────────────────────────── */}
        <div style={{
          background: 'var(--cream-dark)',
          border: '1px solid var(--parchment)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: 28,
          display: 'flex', flexDirection: 'column', gap: 14,
          animation: 'fadeInUp 0.4s var(--ease-out) 0.1s both',
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, author, or keyword…"
              value={search}
              onChange={handleSearchChange}
              style={{ paddingLeft: 42, fontSize: '0.95rem' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', fontSize: '1rem' }}>
                ✕
              </button>
            )}
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={{ flex: 1, minWidth: 140 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            <select className="form-select" value={condition} onChange={e => { setCondition(e.target.value); setPage(1); }} style={{ flex: 1, minWidth: 120 }}>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>

            <select className="form-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ flex: 1, minWidth: 140 }}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {hasFilters && (
              <button onClick={resetFilters} className="btn-ghost" style={{ color: 'var(--rust)', whiteSpace: 'nowrap' }}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Category pills ───────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28, animation: 'fadeInUp 0.4s var(--ease-out) 0.15s both' }}>
          {CATEGORIES.slice(0, 10).map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${category === cat ? 'var(--amber)' : 'var(--parchment)'}`,
                background: category === cat ? 'rgba(200,133,58,0.12)' : 'transparent',
                color: category === cat ? 'var(--amber-dark)' : 'var(--ink-muted)',
                fontSize: '0.82rem',
                fontWeight: category === cat ? 600 : 400,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Results ──────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : books.length > 0 ? (
          <>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: 16 }}>
              Showing {books.length} of {pagination.total} books
            </p>
            <div className="books-grid">
              {books.map(book => (
                <BookCard key={book._id} book={book} onSwapRequest={onSwapRequest} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary"
                  style={{ padding: '8px 18px', opacity: page === 1 ? 0.4 : 1 }}
                >
                  ← Prev
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: 'var(--ink-faint)', padding: '0 4px' }}>…</span>}
                      <button
                        onClick={() => setPage(p)}
                        style={{
                          width: 36, height: 36,
                          borderRadius: 8,
                          border: `1.5px solid ${p === page ? 'var(--amber)' : 'var(--parchment)'}`,
                          background: p === page ? 'var(--amber)' : 'transparent',
                          color: p === page ? 'white' : 'var(--ink-muted)',
                          fontFamily: 'var(--font-body)',
                          fontWeight: p === page ? 600 : 400,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {p}
                      </button>
                    </span>
                  ))
                }

                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="btn-secondary"
                  style={{ padding: '8px 18px', opacity: page === pagination.pages ? 0.4 : 1 }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--parchment)',
          }}>
            <p style={{ fontSize: '3rem', marginBottom: 16 }}>📭</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 8 }}>
              No books found
            </p>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
              {hasFilters ? 'Try adjusting your filters or search term.' : 'No books listed yet. Be the first!'}
            </p>
            {hasFilters && (
              <button onClick={resetFilters} className="btn-primary">Clear Filters</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
