// src/pages/AddBookPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES  = ['Fiction','Non-Fiction','Science Fiction','Fantasy','Mystery','Thriller','Romance','Biography','Self-Help','History','Science','Technology','Philosophy','Children','Comics','Poetry','Other'];
const CONDITIONS  = ['New','Like New','Good','Fair','Poor'];
const LANGUAGES   = ['English','Hindi','Marathi','Tamil','Telugu','Bengali','Gujarati','Kannada','Malayalam','Urdu','Other'];

const CONDITION_DESC = {
  'New':      'Unused, no marks or damage.',
  'Like New': 'Barely used, almost perfect.',
  'Good':     'Minor wear, fully readable.',
  'Fair':     'Noticeable wear but intact.',
  'Poor':     'Heavy wear, still readable.',
};

export default function AddBookPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const editBook  = location.state?.editBook;

  const [form, setForm] = useState({
    title:        editBook?.title        || '',
    author:       editBook?.author       || '',
    description:  editBook?.description  || '',
    category:     editBook?.category     || 'Fiction',
    condition:    editBook?.condition    || 'Good',
    language:     editBook?.language     || 'English',
    isbn:         editBook?.isbn         || '',
    publishedYear:editBook?.publishedYear|| '',
    tags:         editBook?.tags?.join(', ') || '',
  });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(editBook?.image || '');
  const [loading,      setLoading]      = useState(false);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [dragOver,     setDragOver]     = useState(false);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onImageChange = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onImageChange(file);
  };

  const generateAIDescription = async () => {
    if (!form.title || !form.author) {
      toast.error('Enter title and author first.');
      return;
    }
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/generate-description', {
        title: form.title, author: form.author, category: form.category,
      });
      setForm(f => ({ ...f, description: data.description }));
      toast.success(data.aiGenerated ? 'AI description generated! ✨' : 'Description added!');
    } catch {
      toast.error('Could not generate description.');
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      toast.error('Title and author are required.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (imageFile) formData.append('image', imageFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      let data;
      if (editBook) {
        ({ data } = await api.put(`/books/${editBook._id}`, formData, config));
        toast.success('Book updated! ✅');
      } else {
        ({ data } = await api.post('/books', formData, config));
        toast.success('Book listed successfully! 🎉');
      }

      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 860 }}>

        {/* Header */}
        <div style={{ marginBottom: 36, animation: 'fadeInUp 0.4s var(--ease-out) both' }}>
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 16, paddingLeft: 0 }}>
            ← Back
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)' }}>
            {editBook ? 'Edit Book' : 'List a Book'}
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: 6 }}>
            {editBook ? 'Update your book listing.' : 'Share a book you own and want to exchange.'}
          </p>
        </div>

        <form onSubmit={onSubmit} encType="multipart/form-data">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, animation: 'fadeInUp 0.4s var(--ease-out) 0.1s both' }}>

            {/* Left: Image upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById('book-image-input').click()}
                style={{
                  width: '100%',
                  aspectRatio: '2/3',
                  border: `2px dashed ${dragOver ? 'var(--amber)' : 'var(--parchment)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: dragOver ? 'rgba(200,133,58,0.05)' : 'var(--cream-dark)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <span style={{ fontSize: '2.5rem', marginBottom: 10 }}>📸</span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', textAlign: 'center', padding: '0 12px' }}>
                      Click or drag to upload<br />book cover
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 8 }}>JPG, PNG, WebP · max 5MB</p>
                  </>
                )}
              </div>
              <input
                id="book-image-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => onImageChange(e.target.files[0])}
              />
              {imagePreview && (
                <button type="button" className="btn-ghost" onClick={() => { setImageFile(null); setImagePreview(''); }}
                  style={{ fontSize: '0.8rem', color: 'var(--rust)' }}>
                  ✕ Remove image
                </button>
              )}

              {/* Condition card */}
              <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-md)', padding: 16, border: '1px solid var(--parchment)' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Condition Guide</p>
                {Object.entries(CONDITION_DESC).map(([c, d]) => (
                  <div key={c} style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: form.condition === c ? 'var(--amber)' : 'var(--ink-soft)' }}>{c}: </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Book Title *</label>
                  <input name="title" value={form.title} onChange={onChange}
                    className="form-input" placeholder="e.g. The Great Gatsby" required />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Author *</label>
                  <input name="author" value={form.author} onChange={onChange}
                    className="form-input" placeholder="e.g. F. Scott Fitzgerald" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" value={form.category} onChange={onChange} className="form-select">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition *</label>
                  <select name="condition" value={form.condition} onChange={onChange} className="form-select">
                    {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select name="language" value={form.language} onChange={onChange} className="form-select">
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Published Year</label>
                  <input name="publishedYear" value={form.publishedYear} onChange={onChange}
                    className="form-input" placeholder="e.g. 2001" type="number" min="1800" max={new Date().getFullYear()} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">ISBN (optional)</label>
                  <input name="isbn" value={form.isbn} onChange={onChange}
                    className="form-input" placeholder="978-0-00-000000-0" />
                </div>
              </div>

              {/* Description with AI */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Description</span>
                  <button type="button" onClick={generateAIDescription} disabled={aiLoading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'rgba(200,133,58,0.1)', border: '1px solid rgba(200,133,58,0.3)',
                      borderRadius: 20, padding: '4px 12px',
                      color: 'var(--amber-dark)', fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                      transition: 'all 0.2s',
                    }}>
                    {aiLoading ? '⏳ Generating…' : '✨ AI Generate'}
                  </button>
                </label>
                <textarea name="description" value={form.description} onChange={onChange}
                  className="form-textarea" placeholder="Tell readers about this book…" rows={4} />
              </div>

              {/* Tags */}
              <div className="form-group">
                <label className="form-label">Tags <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>(comma-separated)</span></label>
                <input name="tags" value={form.tags} onChange={onChange}
                  className="form-input" placeholder="e.g. classic, adventure, coming-of-age" />
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
                  {loading ? 'Saving…' : editBook ? '✓ Update Book' : '🎉 List Book'}
                </button>
                <button type="button" onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '14px 20px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 640px) {
          form > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
