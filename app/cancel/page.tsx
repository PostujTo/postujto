'use client';

import Link from 'next/link';

export default function CancelPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f5', fontFamily: 'var(--font-dm-sans), sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <style>{`
        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s; text-decoration: none; display: inline-block; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: rgba(240,240,245,0.7); cursor: pointer; font-weight: 600; transition: all 0.2s; text-decoration: none; display: inline-block; }
        .btn-secondary:hover { background: rgba(255,255,255,0.09); color: #f0f0f5; }
      `}</style>

      <div style={{ maxWidth: 500, width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '48px 40px', textAlign: 'center' }}>

        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 36 }}>
          ↩
        </div>

        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Płatność <span className="gradient-text">anulowana</span>
        </h1>

        <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.5)', lineHeight: 1.7, marginBottom: 32 }}>
          Nie pobrano żadnych opłat. Możesz wrócić do cennika i spróbować ponownie w dowolnym momencie.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <Link href="/pricing" className="btn-primary" style={{ padding: '14px 28px', borderRadius: 12, fontSize: 15 }}>
            Wróć do cennika
          </Link>
          <Link href="/app" className="btn-secondary" style={{ padding: '13px 28px', borderRadius: 12, fontSize: 14 }}>
            Kontynuuj bezpłatnie
          </Link>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <a href="mailto:hello@postujto.com" style={{ fontSize: 13, color: 'rgba(240,240,245,0.35)', textDecoration: 'none' }}>Masz pytania?</a>
          <Link href="/terms" style={{ fontSize: 13, color: 'rgba(240,240,245,0.35)', textDecoration: 'none' }}>Regulamin</Link>
          <Link href="/privacy" style={{ fontSize: 13, color: 'rgba(240,240,245,0.35)', textDecoration: 'none' }}>Polityka prywatności</Link>
        </div>
      </div>
    </div>
  );
}