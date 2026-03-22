'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppHeader } from '@/components/AppHeader';

export default function AuditPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState('');
  const [error, setError] = useState('');
  const [isAnnual, setIsAnnual] = useState<boolean | null>(null);
  const [nextAuditAt, setNextAuditAt] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState('free');

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/plan')
      .then(r => r.json())
      .then(d => {
        setCurrentPlan(d.plan || 'free');
        setIsAnnual(d.is_annual === true);
      });
  }, [user]);

  const handleAudit = async () => {
    if (posts.trim().length < 50) return;
    setIsLoading(true);
    setError('');
    setAuditResult('');
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'limit') {
          setNextAuditAt(data.nextAuditAt);
          setError('limit');
        } else {
          setError(data.error || 'Błąd serwera');
        }
      } else {
        setAuditResult(data.result);
      }
    } catch {
      setError('Błąd połączenia');
    } finally {
      setIsLoading(false);
    }
  };

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 28,
  };

  // Loading state
  if (isAnnual === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: '"DM Sans", sans-serif', color: '#f0f0f5' }}>
        <AppHeader activePage="settings" credits={{ plan: currentPlan, remaining: 0, total: 0 }} />
      </div>
    );
  }

  // No annual plan
  if (!isAnnual) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: '"DM Sans", sans-serif', color: '#f0f0f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
          <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 12, letterSpacing: '-0.02em' }}>
            Audyt profilu przez AI
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.5)', lineHeight: 1.7, marginBottom: 28 }}>
            Audyt jest bonusem dostępnym tylko dla użytkowników planów rocznych.
          </p>
          <a href="/pricing" style={{ display: 'inline-block', padding: '14px 28px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', borderRadius: 14 }}>
            Przejdź na plan roczny →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: '"DM Sans", sans-serif', color: '#f0f0f5' }}>
      <AppHeader activePage="settings" credits={{ plan: currentPlan, remaining: 0, total: 0 }} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 32, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
            🔍 Audyt profilu przez AI
          </h1>
          <p style={{ color: 'rgba(240,240,245,0.4)', fontSize: 15 }}>
            Bonus planu rocznego — limit 1 audyt co 3 miesiące
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.65)', lineHeight: 1.7, marginBottom: 16 }}>
              Wklej 3–5 swoich ostatnich postów. Claude przeanalizuje je i da Ci spersonalizowane wskazówki
              jak pisać lepiej dla swojej branży.
            </p>
            <textarea
              placeholder="Wklej tutaj swoje ostatnie posty (każdy post oddziel linią ---)"
              rows={10}
              value={posts}
              onChange={e => setPosts(e.target.value)}
              style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#f0f0f5', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 } as React.CSSProperties}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.25)' }}>{posts.length} znaków</span>
              <button
                onClick={handleAudit}
                disabled={isLoading || posts.trim().length < 50}
                style={{ padding: '12px 28px', background: isLoading || posts.trim().length < 50 ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', borderRadius: 12, color: isLoading || posts.trim().length < 50 ? 'rgba(240,240,245,0.3)' : '#fff', fontWeight: 700, fontSize: 15, cursor: isLoading || posts.trim().length < 50 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              >
                {isLoading ? '⏳ Analizuję...' : 'Przeprowadź audyt →'}
              </button>
            </div>
          </div>

          {error === 'limit' && nextAuditAt && (
            <div style={{ ...card, borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.05)' }}>
              <p style={{ fontSize: 14, color: '#fbbf24', fontWeight: 600 }}>
                ⚠️ Audyt już wykorzystany
              </p>
              <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.5)', marginTop: 6 }}>
                Następny audyt będzie dostępny od:{' '}
                <strong style={{ color: '#f0f0f5' }}>
                  {new Date(nextAuditAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </strong>
              </p>
            </div>
          )}

          {error && error !== 'limit' && (
            <p style={{ fontSize: 13, color: '#f87171' }}>⚠️ {error}</p>
          )}

          {auditResult && (
            <div style={card}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Wyniki audytu</p>
              <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.75)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {auditResult}
              </div>
              <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.2)', marginTop: 20 }}>
                Audyt wygenerowany przez Claude AI. Następny audyt będzie dostępny za 3 miesiące.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
