// src/components/Loader.jsx
export default function Loader({ fullScreen = false, size = 36 }) {
  const spinner = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <circle cx="18" cy="18" r="15" stroke="var(--parchment)" strokeWidth="3" />
      <path
        d="M18 3 A15 15 0 0 1 33 18"
        stroke="var(--amber)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );

  if (fullScreen) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {spinner}
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)', fontSize: '1.1rem' }}>
            BookSwap
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      {spinner}
    </div>
  );
}
