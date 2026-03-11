'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: 'Czy mogę przetestować PostujTo za darmo?', a: 'Tak! Po rejestracji otrzymujesz 5 darmowych kredytów — bez karty kredytowej. Każdy kredyt to jedno generowanie 3 wersji posta.' },
    { q: 'Czy posty są generowane po polsku?', a: 'Tak, wszystkie posty są generowane naturalną polszczyzną, z uwzględnieniem polskich zwrotów marketingowych i prawa reklamowego.' },
    { q: 'Czym różni się Starter od Pro?', a: 'Starter (79 zł/msc) zawiera unlimited posty, obrazy AI i Brand Kit. Pro (199 zł/msc) dodaje automatyczne 3 obrazy do każdego posta i logo na obrazach.' },
    { q: 'Czy mogę anulować subskrypcję?', a: 'Tak, w dowolnym momencie przez Panel → Subskrypcja. Zachowujesz dostęp do końca opłaconego okresu. Odnowienia są bezzwrotne.' },
    { q: 'Czy moje dane są bezpieczne?', a: 'Dane przechowujemy na serwerach w Irlandii (UE). Płatności obsługuje Stripe. Treści generowane przez AI nie są używane do trenowania modeli.' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          border: `1px solid ${open === i ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 14, overflow: 'hidden',
          transition: 'border-color 0.2s'
        }}
          onMouseEnter={e => { if (open !== i) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)'; }}
          onMouseLeave={e => { if (open !== i) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left',
              background: open === i ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
              border: 'none', cursor: 'pointer', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
              fontFamily: "'DM Sans', sans-serif", color: '#f0f0f5',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => { if (open !== i) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { if (open !== i) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{item.q}</span>
            <span style={{ fontSize: 18, color: open === i ? '#a5b4fc' : 'rgba(240,240,245,0.3)', transition: 'all 0.2s', transform: open === i ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
          </button>
          {open === i && (
            <div style={{ padding: '0 24px 20px', fontSize: 14, color: 'rgba(240,240,245,0.65)', lineHeight: 1.8 }}>{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [landingBilling, setLandingBilling] = useState<'monthly' | 'annual'>('monthly');
const { user } = useUser();
const [showTermsModal, setShowTermsModal] = useState(false);
const [termsChecked, setTermsChecked] = useState(false);
const [pendingPriceId, setPendingPriceId] = useState<string | null>(null);
const [pendingPlan, setPendingPlan] = useState<string | null>(null);
const [checkoutLoading, setCheckoutLoading] = useState(false);

const handleLandingSubscribe = (priceId: string, planName: string) => {
  if (!user) { window.location.href = '/app'; return; }
  setPendingPriceId(priceId);
  setPendingPlan(planName);
  setTermsChecked(false);
  setShowTermsModal(true);
};

const handleConfirmTerms = async () => {
  if (!pendingPriceId || !pendingPlan) return;
  setCheckoutLoading(true);
  await fetch('/api/user/accept-terms', { method: 'POST' });
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: pendingPriceId, userId: user!.id }),
    });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  } catch {
    alert('Wystąpił błąd. Spróbuj ponownie.');
  } finally {
    setCheckoutLoading(false);
  }
};
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <>
      <style jsx global>{`

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: var(--font-dm-sans), sans-serif; background: #0a0a0f; color: #f0f0f5; overflow-x: hidden; }

        font-family: var(--font-poppins), sans-serif;

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-2deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 60px rgba(99, 102, 241, 0.8), 0 0 100px rgba(99, 102, 241, 0.3); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: floatReverse 7s ease-in-out infinite; }
        .animate-ticker { animation: ticker 25s linear infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }

        .text-shimmer {
          background: linear-gradient(90deg, #fff 0%, #a5b4fc 40%, #fff 60%, #c4b5fd 80%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: 0.02em;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .btn-primary:hover::after { opacity: 1; }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: #f0f0f5;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3);
        }

        .card-glass {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .card-glass:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-4px);
        }

        .section-reveal {
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .section-reveal.visible { opacity: 1; }
        .section-reveal.from-up { transform: translateY(40px); }
        .section-reveal.from-up.visible { transform: translateY(0); }
        .section-reveal.from-left { transform: translateX(-40px); }
        .section-reveal.from-left.visible { transform: translateX(0); }
        .section-reveal.from-right { transform: translateX(40px); }
        .section-reveal.from-right.visible { transform: translateX(0); }
        .section-reveal.scale { transform: scale(0.93); }
        .section-reveal.scale.visible { transform: scale(1); }

        .mesh-bg {
          background:
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(168, 85, 247, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 60% 80%, rgba(236, 72, 153, 0.08) 0%, transparent 60%),
            #0a0a0f;
        }

        .noise-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .pricing-card {
          position: relative;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pricing-card:hover { transform: translateY(-8px); }
        .pricing-card.featured {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.15));
          border-color: rgba(99, 102, 241, 0.5) !important;
        }
        .pricing-card.featured::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          z-index: -1;
          opacity: 0.5;
        }

        .step-number {
          font-family: 'Syne', sans-serif;
          font-size: 5rem;
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(180deg, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0.1) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-number {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 3px; }
      `}</style>

{showTermsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 24, padding: 40, maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f5', marginBottom: 12, letterSpacing: '-0.01em' }}>Zanim przejdziesz do płatności</h3>
            <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.55)', lineHeight: 1.7, marginBottom: 28 }}>
              Prosimy o zapoznanie się z dokumentami prawnymi serwisu PostujTo.
            </p>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '16px 20px', background: termsChecked ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${termsChecked ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, marginBottom: 24, transition: 'all 0.2s', textAlign: 'left' }}>
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={e => setTermsChecked(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: '#6366f1', flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.65)', lineHeight: 1.6 }}>
                Zapoznałem/am się z{' '}
                <a href="/terms" target="_blank" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>Regulaminem</a>
                {' '}i{' '}
                <a href="/privacy" target="_blank" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>Polityką prywatności</a>
                {' '}serwisu PostujTo i akceptuję ich treść. Wyrażam zgodę na natychmiastowe rozpoczęcie świadczenia usługi i przyjmuję do wiadomości, że po uruchomieniu subskrypcji tracę prawo do odstąpienia od umowy zgodnie z art. 38 pkt 13 ustawy o prawach konsumenta.
              </span>
            </label>
            <button
              onClick={handleConfirmTerms}
              disabled={!termsChecked || checkoutLoading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, border: 'none', cursor: termsChecked ? 'pointer' : 'not-allowed', background: termsChecked ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)', color: termsChecked ? '#fff' : 'rgba(240,240,245,0.3)', transition: 'all 0.2s', marginBottom: 12 }}
            >
              {checkoutLoading ? 'Ładowanie...' : 'Akceptuję — przejdź do płatności →'}
            </button>
            <button
              onClick={() => setShowTermsModal(false)}
              style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(240,240,245,0.4)', cursor: 'pointer' }}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      <div className="noise-overlay" />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 50 ? 'rgba(10,10,15,0.9)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s ease',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <div>
            <span className="font-display" style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Postuj<span className="gradient-text">To</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link href="/pricing" 
              style={{ fontSize: 14, color: 'rgba(240,240,245,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,240,245,0.6)')}>
              Cennik
            </Link>
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/app">
              <button className="btn-secondary" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                Zaloguj się
              </button>
            </SignInButton>
              <Link href="/app">
                <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  <span>Wypróbuj za darmo</span>
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  <span>Otwórz generator</span>
                </button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mesh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>

        {/* Floating orbs */}
        <div className="animate-float" style={{ position: 'absolute', top: '15%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="animate-float-reverse" style={{ position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

          {/* Left */}
          <div style={{ animation: 'fadeUp 0.8s ease-out forwards' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, marginBottom: 32 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block', boxShadow: '0 0 8px #6366f1' }} />
              <span style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 500, letterSpacing: '0.05em' }}>AI dla polskich firm</span>
            </div>

            <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
              Twój dział<br />
              social media<br />
              <span className="text-shimmer">z AI po polsku</span>
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(240,240,245,0.6)', lineHeight: 1.7, marginBottom: 40, maxWidth: 480 }}>
              30 postów na Facebook, Instagram i TikTok w 5 minut. Oszczędzasz <strong style={{ color: '#a5b4fc' }}>10 godzin tygodniowo</strong> i zawsze masz pełny kalendarz treści.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/app">
                <button className="btn-primary animate-glow" style={{ padding: '16px 32px', borderRadius: 12, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>✨ Wygeneruj pierwszy post — za darmo</span>
                </button>
              </Link>
            </div>

            {/* Social proof mini */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex' }}>
                {['💼', '🛍️', '💅', '🍽️', '🏠'].map((emoji, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '2px solid #0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i > 0 ? -10 : 0, fontSize: 16 }}>
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.5)', lineHeight: 1.4 }}>
                  Używany przez właścicieli firm w Polsce
                </div>
              </div>
            </div>
          </div>

          {/* Right — Demo card */}
          <div style={{ animation: 'fadeRight 0.8s 0.2s ease-out both' }}>
            <div className="card-glass" style={{ borderRadius: 24, padding: 32, position: 'relative' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
                <span className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'rgba(240,240,245,0.8)', letterSpacing: '0.05em' }}>POSTUJTO GENERATOR</span>
              </div>

              {/* Fake post preview */}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f5' }}>Salon Urody Magda</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)' }}>Facebook • właśnie teraz</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.75)', lineHeight: 1.6, marginBottom: 12 }}>
                  🌸 Wiosna to czas zmian! Odśwież swój look z naszą ofertą zabiegów pielęgnacyjnych. Zarezerwuj termin i skorzystaj z <strong style={{ color: '#a5b4fc' }}>15% rabatu</strong> na pierwsze odwiedziny w marcu.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['#salonurody', '#pielęgnacja', '#wiosna2025', '#piękno'].map(tag => (
                    <span key={tag} style={{ fontSize: 11, color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '3px 8px', borderRadius: 6 }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Wygenerowano w', value: '4 sek' },
                  { label: 'Oszczędzone', value: '47 min' },
                  { label: 'Platforma', value: 'Facebook' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#a5b4fc', marginBottom: 2 }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Glow effect */}
              <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES PILLS */}
      <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Facebook', 'Instagram', 'TikTok', 'Brand Kit', 'AI Obrazy', 'Polskie Okazje', 'Kalendarz Treści', '30 postów w 5 minut', 'Podpis Marki', '14 Branż', 'Guest Mode'].map((item, i) => (
            <span key={i} style={{ fontSize: 13, color: 'rgba(165,180,252,0.8)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 100, padding: '6px 16px' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{ padding: '100px 24px', position: 'relative' }} id="stats" data-animate>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {[
              { value: '10h', label: 'oszczędności tygodniowo' },
              { value: '30', label: 'postów w 5 minut' },
              { value: '3', label: 'platformy jednocześnie' },
              { value: '12', label: 'branż z gotowymi wskazówkami' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`section-reveal from-up ${isVisible('stats') ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 0.1}s`, padding: '48px 32px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', textAlign: 'center' }}
              >
                <div className="stat-number" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: 8 }}>{stat.value}</div>
                <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)', lineHeight: 1.5 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 24px 100px', position: 'relative' }} id="how" data-animate>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className={`section-reveal from-up ${isVisible('how') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 16 }}>Jak to działa?</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Od pomysłu do posta<br /><span className="gradient-text">w 3 krokach</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
                  { step: '01', title: 'Ustaw markę', desc: 'Wpisz nazwę firmy, wybierz branżę i ustaw kolory w Brand Kit. Zrób to raz — AI zawsze będzie pisać w Twoim stylu.', delay: 0 },
                  { step: '02', title: 'Wpisz temat', desc: 'Podaj o czym ma być post lub wybierz z kalendarza polskich okazji. AI dobiera ton, długość i platformę.', delay: 0.15 },
                  { step: '03', title: 'Publikuj', desc: 'Dostaniesz 3 gotowe wersje tekstu z hashtagami i grafiką AI. Kopiuj i wrzucaj bezpośrednio na platformy.', delay: 0.3 },
                  ].map((item, i) => (
              <div key={i} className={`section-reveal from-up ${isVisible('how') ? 'visible' : ''}`} style={{ transitionDelay: `${item.delay}s` }}>
            <div className="card-glass" style={{ borderRadius: 20, padding: 36, height: '100%' }}>
              <div style={{ marginBottom: 24 }}>
               <div className="step-number">{item.step}</div>
              </div>
              <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.01em' }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.55)', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          </div>
          ))}
          </div>

          {/* CTA po "Jak to działa" */}
          <div className={`section-reveal from-up ${isVisible('how') ? 'visible' : ''}`} style={{ textAlign: 'center', marginTop: 64, transitionDelay: '0.4s' }}>
            <Link href="/app">
              <button className="btn-primary" style={{ padding: '16px 36px', borderRadius: 12, fontSize: 16, cursor: 'pointer' }}>
                <span>✨ Zacznij za darmo — bez karty kredytowej</span>
              </button>
            </Link>
            <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(240,240,245,0.35)' }}>5 postów gratis • Bez zobowiązań</p>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }} id="features" data-animate>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className={`section-reveal from-up ${isVisible('features') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 16 }}>Co wyróżnia PostujTo</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Zaprojektowane<br /><span className="gradient-text">dla polskiego rynku</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: '🇵🇱', title: 'Polskie okazje', desc: 'Kalendarz świąt i okazji handlowych na 30 dni naprzód. Walentynki, Dzień Matki, Black Friday — wszystko gotowe.' },
              { icon: '⚖️', title: 'Polskie prawo reklamowe', desc: 'Prompty uwzględniają regulacje dotyczące reklamy w Polsce. Bezpieczne treści dla salonów, przychodni i firm finansowych.' },
              { icon: '🎨', title: 'Brand Kit', desc: 'Skonfiguruj kolory, logo i ton marki raz. Każdy post będzie spójny z Twoją identyfikacją wizualną.' },
              { icon: '🖼️', title: 'Grafiki AI (Recraft V3)', desc: 'Automatyczne generowanie obrazów dopasowanych do posta i Twojej marki. Plan Pro dostaje 3 obrazy od razu.' },
              { icon: '🏷️', title: 'Podpis marki na obrazach', desc: 'Logo firmy nakładane automatycznie w prawym dolnym rogu każdego wygenerowanego obrazu. Tylko plan Pro.' },
              { icon: '📊', title: 'Dashboard i historia', desc: 'Wszystkie wygenerowane posty w jednym miejscu. Filtruj, dodawaj do ulubionych, zarządzaj treściami.' },
            ].map((feature, i) => (
              <div
                key={i}
                className={`section-reveal from-up card-glass ${isVisible('features') ? 'visible' : ''}`}
                style={{ borderRadius: 16, padding: 28, transitionDelay: `${(i % 3) * 0.1}s` }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{feature.icon}</div>
                <h3 className="font-display" style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{feature.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.5)', lineHeight: 1.65 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* DLA KOGO */}
      <section style={{ padding: '80px 24px 100px' }} id="usecases" data-animate>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className={`section-reveal from-up ${isVisible('usecases') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 16 }}>Dla kogo?</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Działa dla każdej<br /><span className="gradient-text">polskiej firmy</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                emoji: '💅',
                type: 'Salon kosmetyczny',
                owner: 'Magda, właścicielka salonu urody',
                problem: 'Codziennie po 10h pracy nie mam siły pisać postów. Przez miesiąc nie opublikowałam nic.',
                result: 'Teraz planuję cały miesiąc w niedzielę. 30 postów w 10 minut.',
                delay: 0,
              },
              {
                emoji: '🛒',
                type: 'Sklep internetowy',
                owner: 'Tomek, sklep z elektroniką',
                problem: 'Copywriter kosztował 2000 zł miesięcznie. Za dużo jak na mały sklep.',
                result: 'PostujTo kosztuje ułamek tego. Posty są lepsze bo zna mój asortyment.',
                delay: 0.1,
              },
              {
                emoji: '🍽️',
                type: 'Restauracja',
                owner: 'Kasia, restauracja włoska w Krakowie',
                problem: 'Nikt w ekipie nie chciał zajmować się social media. Profil stał martwy.',
                result: 'Chef wpisuje danie dnia, AI robi resztę. Mamy teraz 3x więcej rezerwacji przez Instagram.',
                delay: 0.2,
              },
              {
                emoji: '🔨',
                type: 'Firma budowlana',
                owner: 'Marek, ekipa remontowa',
                problem: 'Nie wiedziałem jak pisać o remontach żeby brzmiało profesjonalnie, nie jak ogłoszenie.',
                result: 'Teraz pokazuję realizacje z profesjonalnymi opisami. Klienci sami piszą po zobaczyeniu postów.',
                delay: 0.3,
              },
              {
                emoji: '🏠',
                type: 'Agencja nieruchomości',
                owner: 'Piotr, pośrednik w Warszawie',
                problem: 'Każde ogłoszenie musiałem opisywać osobno. Straciłem na to setki godzin.',
                result: 'Wpisuję adres i cechy mieszkania — post z hashtagami gotowy w 8 sekund.',
                delay: 0.4,
              },
              {
                emoji: '📚',
                type: 'Szkoła językowa',
                owner: 'Ania, szkoła angielskiego online',
                problem: 'Prowadziłam kursy i blog, nie miałam głowy do wymyślania postów co drugi dzień.',
                result: 'Kalendarz treści na cały miesiąc wygenerowałam w 5 minut. Mam temat na każdy dzień.',
                delay: 0.5,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`section-reveal from-up card-glass ${isVisible('usecases') ? 'visible' : ''}`}
                style={{ borderRadius: 18, padding: 28, transitionDelay: `${item.delay}s` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{item.emoji}</div>
                  <div>
                    <p className="font-display" style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f5', marginBottom: 2 }}>{item.type}</p>
                    <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)' }}>{item.owner}</p>
                  </div>
                </div>
                <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, marginBottom: 12 }}>
                  <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.55)', lineHeight: 1.6, fontStyle: 'italic' }}>"{item.problem}"</p>
                </div>
                <div style={{ padding: '14px 16px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.75)', lineHeight: 1.6 }}>✅ {item.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
 
{/* BEZPIECZEŃSTWO DANYCH */}
      <section style={{ padding: '80px 24px' }} id="security" data-animate>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className={`section-reveal from-up ${isVisible('security') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 16 }}>Bezpieczeństwo</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Jak dbamy o <span className="gradient-text">Twoje dane</span>
            </h2>
            <p style={{ marginTop: 16, color: 'rgba(240,240,245,0.5)', fontSize: 16, maxWidth: 560, margin: '16px auto 0' }}>
              Twoje dane są bezpieczne. Stosujemy najwyższe standardy ochrony.
            </p>
          </div>

          <div className={`section-reveal from-up ${isVisible('security') ? 'visible' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, transitionDelay: '0.1s' }}>
            {[
              { icon: '🔒', title: 'Szyfrowanie TLS 1.3', desc: 'Każde połączenie z serwisem jest szyfrowane. Twoje dane są bezpieczne w transmisji.' },
              { icon: '🇮🇪', title: 'Serwery w Irlandii', desc: 'Dane przechowujemy na serwerach Supabase w Irlandii.' },
              { icon: '💳', title: 'Stripe PCI DSS Level 1', desc: 'Dane kart płatniczych nigdy nie trafiają na nasze serwery. Obsługuje je Stripe.' },
              { icon: '🤖', title: 'AI nie uczy się na Twoich danych', desc: 'Treści które generujesz nie są używane do trenowania modeli AI przez Anthropic.' },
              { icon: '👁️', title: 'Ograniczony dostęp', desc: 'Dostęp do danych produkcyjnych mają tylko niezbędne systemy. Żadnych osób trzecich.' },
              { icon: '🛡️', title: 'RODO / GDPR', desc: 'W pełni zgodni z RODO. Możesz pobrać, poprawić lub usunąć swoje dane w każdej chwili.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, transition: 'all 0.2s ease', cursor: 'default' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.025)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                  >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f5', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.5)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className={`section-reveal from-up ${isVisible('security') ? 'visible' : ''}`} style={{ textAlign: 'center', marginTop: 32, transitionDelay: '0.2s' }}>
            <Link href="/privacy" style={{ fontSize: 14, color: '#a5b4fc', textDecoration: 'none' }}>
              Przeczytaj pełną Politykę prywatności →
            </Link>
          </div>
        </div>
      </section>

      {/* CENNIK */}
      <section style={{ padding: '80px 0' }} id="pricing" data-animate>
  <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
    <div className={`section-reveal from-up ${isVisible('pricing') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 40 }}>
      <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 16 }}>Cennik</div>
      <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
        Proste ceny,<br /><span className="gradient-text">bez ukrytych kosztów</span>
      </h2>
      <p style={{ marginTop: 16, fontSize: 16, color: 'rgba(240,240,245,0.5)' }}>7-dniowa gwarancja zwrotu. Anulujesz jednym kliknięciem.</p>
    </div>

    {/* BILLING TOGGLE */}
    <div className={`section-reveal from-up ${isVisible('pricing') ? 'visible' : ''}`} style={{ display: 'flex', justifyContent: 'center', marginBottom: 48, transitionDelay: '0.05s' }}>
  <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 4, gap: 4 }}>
    {(['monthly', 'annual'] as const).map((option) => (
      <button
        key={option}
        onClick={() => setLandingBilling(option)}
        style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: landingBilling === option ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent', color: landingBilling === option ? '#fff' : 'rgba(240,240,245,0.45)' }}
      >
        {option === 'monthly' ? 'Miesięczny' : 'Roczny'}
      </button>
    ))}
  </div>
</div>

    <div className={`section-reveal from-up ${isVisible('pricing') ? 'visible' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, transitionDelay: '0.1s' }}>
  {[
    {
      name: 'Free', price: '0', period: 'jednorazowo', desc: 'Wypróbuj bez rejestracji',
      features: ['1 post bez logowania', '5 postów po rejestracji', 'Facebook, Instagram, TikTok', 'Wszystkie branże'],
      featured: false, href: '/app', cta: 'Zacznij za darmo',
    },
    {
      name: 'Starter',
      price: landingBilling === 'monthly' ? '79' : '63',
      period: landingBilling === 'monthly' ? '/ miesiąc' : '/ miesiąc • płacisz 756 zł/rok',
      desc: landingBilling === 'monthly' ? '2,60 zł dziennie' : 'Oszczędzasz 192 zł rocznie',
      features: ['Unlimited postów', 'Generowanie obrazów AI', 'Brand Kit', 'Historia i ulubione', 'Kalendarz polskich okazji'],
      featured: true, badge: 'NAJPOPULARNIEJSZY', href: '/pricing', cta: 'Wybierz Starter',
    },
    {
      name: 'Pro',
      price: landingBilling === 'monthly' ? '199' : '159',
      period: landingBilling === 'monthly' ? '/ miesiąc' : '/ miesiąc • płacisz 1908 zł/rok',
      desc: landingBilling === 'monthly' ? '6,60 zł dziennie' : 'Oszczędzasz 480 zł rocznie',
      features: ['Wszystko ze Starter', 'Auto 3 obrazy przy każdym poście', 'Podpis marki na obrazach', 'Priorytetowe generowanie'],
      featured: false, href: '/pricing', cta: 'Wybierz Pro',
    },
  ].map((plan, i) => (
    <div key={i}
  className="pricing-card-landing"
  style={{ borderRadius: 20, padding: 36, border: plan.featured ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)', background: plan.featured ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))' : 'rgba(255,255,255,0.03)', position: 'relative', display: 'flex', flexDirection: 'column', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'; (e.currentTarget as HTMLElement).style.borderColor = plan.featured ? 'rgba(99,102,241,0.8)' : 'rgba(99,102,241,0.4)'; }}
  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = plan.featured ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'; }}
>
      {plan.badge && (
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '5px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'white', whiteSpace: 'nowrap' }}>
          {plan.badge}
        </div>
      )}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{plan.name}</span>
      </div>
      <div style={{ marginBottom: 4, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0f5' }}>{plan.price} <span style={{ fontSize: 18 }}>zł</span></span>
        {landingBilling === 'annual' && plan.name !== 'Free' && (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', padding: '2px 8px', borderRadius: 100 }}>-20%</span>
        )}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', marginBottom: 8 }}>{plan.period}</div>
      <div style={{ fontSize: 14, color: landingBilling === 'annual' && plan.name !== 'Free' ? '#4ade80' : 'rgba(240,240,245,0.55)', marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: landingBilling === 'annual' && plan.name !== 'Free' ? 600 : 400 }}>{plan.desc}</div>
      <ul style={{ listStyle: 'none', marginBottom: 32, flex: 1 }}>
        {plan.features.map((f, fi) => (
          <li key={fi} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 14, color: 'rgba(240,240,245,0.7)' }}>
            <span style={{ color: '#6366f1', flexShrink: 0, marginTop: 1 }}>✓</span>{f}
          </li>
        ))}
      </ul>
      {plan.name === 'Free' ? (
            <Link href="/app">
              <button className="btn-secondary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
                {plan.cta}
              </button>
            </Link>
          ) : (
            <button
              className={plan.featured ? 'btn-primary' : 'btn-secondary'}
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, border: plan.featured ? 'none' : '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
              onClick={() => handleLandingSubscribe(
                landingBilling === 'monthly'
                  ? (plan.name === 'Starter' ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD! : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM!)
                  : (plan.name === 'Starter' ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_ANNUAL! : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_ANNUAL!),
                plan.name
              )}
            >
              <span>{plan.cta}</span>
            </button>
          )}
    </div>
  ))}
</div>

    <div className={`section-reveal from-up ${isVisible('pricing') ? 'visible' : ''}`} style={{ textAlign: 'center', marginTop: 32, transitionDelay: '0.2s' }}>
      <Link href="/pricing" style={{ fontSize: 14, color: '#a5b4fc', textDecoration: 'none' }}>
        Zobacz pełne porównanie planów →
      </Link>
    </div>
  </div>
</section>

{/* FAQ */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.01)' }} id="faq" data-animate>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className={`section-reveal ${isVisible('faq') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Pytania i odpowiedzi</p>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Często zadawane <span className="gradient-text">pytania</span>
            </h2>
          </div>
          <FaqAccordion />
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/faq" style={{ fontSize: 14, color: '#a5b4fc', textDecoration: 'none' }}>
              Zobacz wszystkie pytania →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px 120px' }} id="cta" data-animate>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div
            className={`section-reveal scale ${isVisible('cta') ? 'visible' : ''}`}
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 28, padding: '72px 48px' }}
          >
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>
              Gotowy żeby przestać<br /><span className="gradient-text">tracić czas na posty?</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(240,240,245,0.55)', marginBottom: 40, lineHeight: 1.7 }}>
              Zacznij za darmo, bez karty kredytowej.<br />Pierwszy post wygenerujesz w mniej niż minutę.
            </p>
            <Link href="/app">
              <button className="btn-primary animate-glow" style={{ padding: '18px 40px', borderRadius: 14, fontSize: 17, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                <span>✨ Wygeneruj post teraz — za darmo</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <span className="font-display" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Postuj<span className="gradient-text">To</span>
            </span>
            <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.3)', marginTop: 6 }}>
              © 2026 PostujTo.com · Wykonane z ❤️ w Polsce
            </p>
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Cennik', href: '/pricing' },
              { label: 'Regulamin', href: '/terms' },
              { label: 'Prywatność', href: '/privacy' },
              { label: 'FAQ', href: '/faq' },
            ].map(link => (
              <Link key={link.label} href={link.href} style={{ fontSize: 14, color: 'rgba(240,240,245,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#a5b4fc'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(240,240,245,0.4)'}
              >
                {link.label}
              </Link>
            ))}
            <SignedIn>
              <Link href="/dashboard" style={{ fontSize: 14, color: 'rgba(240,240,245,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#a5b4fc'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(240,240,245,0.4)'}
              >
                Dashboard
              </Link>
            </SignedIn>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
            {[
              { label: 'TikTok', href: 'https://www.tiktok.com/@reklamyzpostujto?utm_source=postujto_landing&utm_medium=footer&utm_campaign=social', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.19 8.19 0 004.79 1.54V6.82a4.85 4.85 0 01-1.02-.13z"/></svg> },
              { label: 'Instagram', href: 'https://www.instagram.com/reklamyzpostujto?utm_source=postujto_landing&utm_medium=footer&utm_campaign=social', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
              { label: 'Facebook', href: 'https://www.facebook.com/reklamyzpostujto?utm_source=postujto_landing&utm_medium=footer&utm_campaign=social', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
            ].map(social => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(240,240,245,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,240,245,0.35)')}
              >
                {social.icon}{social.label}
              </a>
            ))}
          </div>
        </div>
        </footer>
      </>
    );
} 