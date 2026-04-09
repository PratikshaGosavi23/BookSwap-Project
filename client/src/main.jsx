// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'DM Sans', sans-serif",
            background: 'var(--cream)',
            color: 'var(--ink)',
            border: '1px solid var(--parchment)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(28,20,16,0.12)',
            fontSize: '0.9rem',
          },
          success: { iconTheme: { primary: '#6B8F71', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#C0442A', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
