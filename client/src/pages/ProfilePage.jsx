// src/pages/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import BookCard from '../components/BookCard';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const INTERESTS_OPTIONS = ['Fiction','Fantasy','Science Fiction','Mystery','Thriller','Romance','Biography','Self-Help','History','Science','Technology','Philosophy','Children','Comics','Poetry','Other'];

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = !id || id === currentUser?._id;

  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [activeTab, setActiveTab] = useState('books');

  const [form, setForm] = useState({ name: '', bio: '', location: '', interests: [] });
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const fileRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (isOwnProfile && currentUser) {
          const { data } = await api.get('/auth/me');
          setProfile(data.user);
          setForm({
            name:      data.user.name      || '',
            bio:       data.user.bio       || '',
            location:  data.user.location  || '',
            interests: data.user.interests || [],
          });
          setAvatarPreview(data.user.avatar || '');
        } else {
          const { data } = await api.get(`/users/${id}`);
          setProfile(data.user);
        }
      } catch {
        toast.error('Could not load profile.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, isOwnProfile]);

  const onAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const toggleInterest = (cat) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(cat)
        ? f.interests.filter(i => i !== cat)
        : [...f.interests, cat],
    }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',      form.name);
      fd.append('bio',       form.bio);
      fd.append('location',  form.location);
      form.interests.forEach(i => fd.append('interests', i));
      if (avatarFile) fd.append('avatar', avatarFile);

      const { data } = await api.put('/users/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(p => ({ ...p, ...data.user }));
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!profile) return null;

  const displayUser = isOwnProfile ? profile : profile;
  const books       = displayUser.booksOwned || [];

  return (
    <div className="page-wrapper" style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* ── Cover / Header ────────────────────────────────────── */}
      <div style={{
        height: 200,
        background: 'linear-gradient(135deg, var(--amber) 0%, var(--amber-dark) 60%, var(--ink-soft) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 35%)' }} />
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        {/* Profile card */}
        <div style={{
          background: 'var(--cream)',
          border: '1px solid var(--parchment)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          marginTop: -60,
          position: 'relative',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 32,
          animation: 'fadeInUp 0.4s var(--ease-out) both',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'var(--amber)',
                border: '4px solid var(--cream)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', color: 'white', fontWeight: 700,
              }}>
                {(editing ? avatarPreview : displayUser.avatar)
                  ? <img src={editing ? avatarPreview : displayUser.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : displayUser.name?.[0]?.toUpperCase()
                }
              </div>
              {editing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--amber)', border: '2px solid var(--cream)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '0.75rem',
                    }}
                  >📷</button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onAvatarChange} />
                </>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink)' }}>{displayUser.name}</h1>
                {isOwnProfile && (
                  <span style={{
                    background: 'rgba(107,143,113,0.15)', color: 'var(--sage)',
                    fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px',
                    borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>You</span>
                )}
              </div>

              {displayUser.location && (
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 8 }}>📍 {displayUser.location}</p>
              )}
              {displayUser.bio && (
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 520 }}>{displayUser.bio}</p>
              )}

              {/* Interests */}
              {displayUser.interests?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {displayUser.interests.map(i => (
                    <span key={i} style={{
                      padding: '3px 10px', borderRadius: 'var(--radius-full)',
                      background: 'rgba(200,133,58,0.10)', color: 'var(--amber-dark)',
                      fontSize: '0.72rem', fontWeight: 600,
                    }}>{i}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ flexShrink: 0 }}>
              {isOwnProfile ? (
                <button onClick={() => setEditing(!editing)} className={editing ? 'btn-ghost' : 'btn-secondary'} style={{ fontSize: '0.875rem' }}>
                  {editing ? '✕ Cancel' : '✏️ Edit Profile'}
                </button>
              ) : (
                <Link to={`/books?owner=${displayUser._id}`} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
                  View Books
                </Link>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--parchment)', flexWrap: 'wrap' }}>
            {[
              { v: books.length,                     l: 'Books' },
              { v: displayUser.swapHistory?.length || 0, l: 'Swaps' },
              { v: displayUser.interests?.length || 0,   l: 'Interests' },
            ].map(({ v, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{v}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Edit Form ─────────────────────────────────────────── */}
        {editing && (
          <div style={{
            background: 'var(--cream)',
            border: '1px solid var(--amber)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            marginBottom: 32,
            animation: 'fadeInUp 0.3s var(--ease-out) both',
            boxShadow: '0 0 0 4px rgba(200,133,58,0.08)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 24, color: 'var(--ink)' }}>Edit Profile</h2>
            <form onSubmit={saveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, Country" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell others about yourself…" rows={3} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Reading Interests</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {INTERESTS_OPTIONS.map(cat => {
                    const sel = form.interests.includes(cat);
                    return (
                      <button key={cat} type="button" onClick={() => toggleInterest(cat)} style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-full)',
                        border: `1.5px solid ${sel ? 'var(--amber)' : 'var(--parchment)'}`,
                        background: sel ? 'rgba(200,133,58,0.12)' : 'transparent',
                        color: sel ? 'var(--amber-dark)' : 'var(--ink-muted)',
                        fontSize: '0.8rem', fontWeight: sel ? 600 : 400,
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        transition: 'all 0.2s',
                      }}>
                        {sel ? '✓ ' : ''}{cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '12px 28px' }}>
                  {saving ? 'Saving…' : '✓ Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary" style={{ padding: '12px 20px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--parchment)', paddingBottom: 0 }}>
          {['books', 'about'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              color: activeTab === tab ? 'var(--amber)' : 'var(--ink-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--amber)' : 'transparent'}`,
              marginBottom: -1,
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}>
              {tab === 'books' ? `📚 Books (${books.length})` : '👤 About'}
            </button>
          ))}
        </div>

        {activeTab === 'books' && (
          books.length > 0 ? (
            <div className="books-grid">
              {books.map(book => (
                <BookCard key={book._id} book={book} showActions={isOwnProfile} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--parchment)' }}>
              <p style={{ fontSize: '2rem', marginBottom: 12 }}>📚</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--ink)', marginBottom: 8 }}>No books listed yet</p>
              {isOwnProfile && <Link to="/add-book" className="btn-primary" style={{ fontSize: '0.875rem' }}>Add a Book</Link>}
            </div>
          )
        )}

        {activeTab === 'about' && (
          <div style={{
            background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)',
            padding: '28px', border: '1px solid var(--parchment)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              {[
                { label: 'Member since', value: new Date(displayUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
                { label: 'Location', value: displayUser.location || '—' },
                { label: 'Email',    value: isOwnProfile ? displayUser.email : '—' },
                { label: 'Books',    value: `${books.length} listed` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
