'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = (analytics: boolean) => {
    localStorage.setItem('cookie_consent', JSON.stringify({ necessary: true, analytics, timestamp: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, right: 24, zIndex: 9999, maxWidth: 520, margin: '0 auto' }}>
      <div style={{ background: 'rgba(13,13,20,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: '20px 24px', backdropFilter: 'blur(24px)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🍪</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f5', marginBottom: 6, fontFamily: "'Poppins', sans-serif" }}>Używamy plików cookies</p>
            <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.55)', lineHeight: 1.6 }}>
              Niezbędne cookies zapewniają działanie serwisu. Analityczne (Cloudflare) pomagają nam go ulepszać.{' '}
              <Link href="/privacy" style={{ color: '#a5b4fc', textDecoration: 'none' }}>Polityka prywatności</Link>
            </p>
          </div>
        </div>

        {expanded && (
          <div style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.8)', fontWeight: 500 }}>🔒 Niezbędne</span>
              <span style={{ fontSize: 11, color: '#4ade80', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '2px 8px', borderRadius: 6 }}>Zawsze aktywne</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', lineHeight: 1.6 }}>Sesja logowania, bezpieczeństwo. Nie wymagają zgody.</p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.8)', fontWeight: 500 }}>📊 Analityczne</span>
              <span style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)' }}>Cloudflare Analytics</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', lineHeight: 1.6 }}>Anonimowe statystyki odwiedzin. Pomagają nam ulepszać serwis.</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => accept(true)}
            style={{ flex: 1, padding: '10px 16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
            Akceptuj wszystkie
          </button>
          <button onClick={() => accept(false)}
            style={{ flex: 1, padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(240,240,245,0.7)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Tylko niezbędne
          </button>
          <button onClick={() => setExpanded(p => !p)}
            style={{ padding: '10px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'rgba(240,240,245,0.4)', fontSize: 12, cursor: 'pointer' }}>
            {expanded ? '▲' : '⚙️'}
          </button>
        </div>
      </div>
    </div>
  );
}