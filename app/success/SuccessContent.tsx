'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ color: 'rgba(240,240,245,0.5)', fontSize: 16 }}>Przetwarzamy Twoją płatność...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f5', fontFamily: 'var(--font-dm-sans), sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <style>{`
        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s; text-decoration: none; display: inline-block; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: rgba(240,240,245,0.7); cursor: pointer; font-weight: 600; transition: all 0.2s; text-decoration: none; display: inline-block; }
        .btn-secondary:hover { background: rgba(255,255,255,0.09); color: #f0f0f5; }
      `}</style>

      <div style={{ maxWidth: 560, width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '48px 40px', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 36 }}>
          ✓
        </div>

        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Płatność <span className="gradient-text">zakończona sukcesem!</span>
        </h1>

        <p style={{ fontSize: 16, color: 'rgba(240,240,245,0.55)', marginBottom: 8 }}>Dziękujemy za subskrypcję PostujTo.</p>

        {user && (
          <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.35)', marginBottom: 32 }}>
            Potwierdzenie wysłano na: <strong style={{ color: 'rgba(240,240,245,0.6)' }}>{user.primaryEmailAddress?.emailAddress}</strong>
          </p>
        )}

        {/* Info box */}
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '24px', marginBottom: 32, textAlign: 'left' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Co dalej?</p>
          {[
            'Twoja subskrypcja jest już aktywna',
            'Możesz generować unlimited postów AI',
            'Subskrypcja odnawia się automatycznie co miesiąc',
            'Anulujesz jednym kliknięciem w ustawieniach',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 14, color: 'rgba(240,240,245,0.65)' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <Link href="/app" className="btn-primary" style={{ padding: '14px 28px', borderRadius: 12, fontSize: 15 }}>
            ✨ Zacznij generować posty
          </Link>
          <Link href="/dashboard" className="btn-secondary" style={{ padding: '13px 28px', borderRadius: 12, fontSize: 14 }}>
            Przejdź do dashboardu
          </Link>
        </div>

        {/* Session ID */}
        {sessionId && (
          <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.2)', marginBottom: 24 }}>
            ID transakcji: {sessionId.substring(0, 30)}...
          </p>
        )}

        {/* Footer links */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <a href="mailto:hello@postujto.com" style={{ fontSize: 13, color: 'rgba(240,240,245,0.35)', textDecoration: 'none' }}>Potrzebujesz pomocy?</a>
          <Link href="/terms" style={{ fontSize: 13, color: 'rgba(240,240,245,0.35)', textDecoration: 'none' }}>Regulamin</Link>
          <Link href="/privacy" style={{ fontSize: 13, color: 'rgba(240,240,245,0.35)', textDecoration: 'none' }}>Polityka prywatności</Link>
        </div>
      </div>
    </div>
  );
}