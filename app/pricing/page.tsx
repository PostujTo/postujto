'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function PricingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [planLoading, setPlanLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [showTermsAlert, setShowTermsAlert] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [pendingPriceId, setPendingPriceId] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) { setPlanLoading(false); return; }
    fetch('/api/user/plan')
      .then(r => r.json())
      .then(data => setCurrentPlan(data.plan || 'free'))
      .finally(() => setPlanLoading(false));
  }, [user]);

  const handleSubscribe = async (priceId: string, planName: string) => {
  if (!user) { window.location.href = '/app'; return; }
  setPendingPriceId(priceId);
  setPendingPlan(planName);
  setTermsChecked(false);
  setShowTermsModal(true);
};

const handleConfirmTerms = async () => {
  if (!pendingPriceId || !pendingPlan) return;
  await fetch('/api/user/accept-terms', { method: 'POST' });
  setShowTermsModal(false);
  setLoading(pendingPlan);
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: pendingPriceId, userId: user!.id }),
    });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
    else throw new Error('Brak URL');
  } catch {
    alert('Wystąpił błąd. Spróbuj ponownie.');
  } finally {
    setLoading(null);
  }
};

  const monthlyPrices = { starter: '79', pro: '199' };
const annualPrices  = { starter: '63', pro: '159' };
const prices = billing === 'monthly' ? monthlyPrices : annualPrices;

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'jednorazowo',
    desc: 'Wypróbuj bez rejestracji',
    features: ['1 post bez logowania', '5 postów po rejestracji', 'Facebook, Instagram, TikTok', 'Wszystkie branże'],
    featured: false,
    badge: null,
    planKey: 'free',
    priceId: null,
  },
  {
    name: 'Starter',
    price: prices.starter,
    period: billing === 'monthly' ? '/ miesiąc' : '/ miesiąc • płacisz 756 zł/rok',
    desc: billing === 'monthly' ? '2,60 zł dziennie' : 'Oszczędzasz 192 zł rocznie',
    features: ['Unlimited postów', 'Generowanie obrazów AI', 'Brand Kit', 'Historia i ulubione', 'Kalendarz polskich okazji'],
    featured: true,
    badge: 'NAJPOPULARNIEJSZY',
    planKey: 'standard',
    priceId: billing === 'monthly'
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_ANNUAL,
  },
  {
    name: 'Pro',
    price: prices.pro,
    period: billing === 'monthly' ? '/ miesiąc' : '/ miesiąc • płacisz 1908 zł/rok',
    desc: billing === 'monthly' ? '6,60 zł dziennie' : 'Oszczędzasz 480 zł rocznie',
    features: ['Wszystko ze Starter', 'Auto 3 obrazy przy każdym poście', 'Podpis marki na obrazach', 'Priorytetowe generowanie'],
    featured: false,
    badge: null,
    planKey: 'premium',
    priceId: billing === 'monthly'
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_ANNUAL,
  },
];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f5', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`
        .btn-primary { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; font-weight: 700; transition: all 0.3s ease; position: relative; overflow: hidden; border: none; cursor: pointer; }
        .btn-primary:hover { filter: brightness(1.25); transform: translateY(-1px); }
        .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #f0f0f5; font-weight: 600; transition: all 0.3s ease; cursor: pointer; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        .pricing-card { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .pricing-card:hover { transform: translateY(-8px); }
        .pricing-card.featured { background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15)); border-color: rgba(99,102,241,0.5) !important; }
        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* TERMS ALERT MODAL */}
      {showTermsModal && (
  <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
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
        disabled={!termsChecked}
        style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, border: 'none', cursor: termsChecked ? 'pointer' : 'not-allowed', background: termsChecked ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)', color: termsChecked ? '#fff' : 'rgba(240,240,245,0.3)', transition: 'all 0.2s', marginBottom: 12 }}
      >
        Akceptuję — przejdź do płatności →
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

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Postuj<span className="gradient-text">To</span>
            </span>
          </Link>
          <Link href="/app">
            <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14 }}>
              Wypróbuj za darmo →
            </button>
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px' }}>
        <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 16 }}>Cennik</div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
          Proste ceny,<br /><span className="gradient-text">bez ukrytych kosztów</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(240,240,245,0.5)', maxWidth: 480, margin: '0 auto' }}>
          7-dniowa gwarancja zwrotu. Anulujesz jednym kliknięciem.
        </p>
        {/* BILLING TOGGLE */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 4, gap: 4 }}>
              {(['monthly', 'annual'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setBilling(option)}
                  style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: billing === option ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent', color: billing === option ? '#fff' : 'rgba(240,240,245,0.45)' }}
                >
                  {option === 'monthly' ? 'Miesięczny' : 'Roczny'}
                </button>
              ))}
            </div>
          </div>
      </div>

      {/* PRICING CARDS */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'stretch' }}>
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`pricing-card ${plan.featured ? 'featured' : ''}`}
            style={{ borderRadius: 20, padding: 36, border: plan.featured ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)', background: plan.featured ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))' : 'rgba(255,255,255,0.03)', position: 'relative', display: 'flex', flexDirection: 'column' }}
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
              {billing === 'annual' && plan.planKey !== 'free' && (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', padding: '2px 8px', borderRadius: 100 }}>-20%</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', marginBottom: 8 }}>{plan.period}</div>
            <div style={{ fontSize: 14, color: billing === 'annual' && plan.planKey !== 'free' ? '#4ade80' : 'rgba(240,240,245,0.55)', marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: billing === 'annual' && plan.planKey !== 'free' ? 600 : 400 }}>{plan.desc}</div>
            <ul style={{ listStyle: 'none', marginBottom: 32, flex: 1 }}>
              {plan.features.map((f, fi) => (
                <li key={fi} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 14, color: 'rgba(240,240,245,0.7)' }}>
                  <span style={{ color: '#6366f1', flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {plan.planKey === 'free' ? (
              <Link href="/app" style={{ display: 'block' }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15 }}>
                  Zacznij za darmo
                </button>
              </Link>
            ) : currentPlan === plan.planKey ? (
              <button disabled style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,240,245,0.4)', cursor: 'not-allowed' }}>
                Twój obecny plan
              </button>
            ) : planLoading ? (
              <button disabled style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, background: 'rgba(99,102,241,0.3)', border: 'none', color: 'rgba(240,240,245,0.5)', cursor: 'not-allowed' }}>
                Ładowanie...
              </button>
            ) : (
              <button
                className={plan.featured ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15 }}
                onClick={() => plan.priceId && handleSubscribe(plan.priceId, plan.planKey)}
                disabled={loading === plan.planKey}
              >
                {loading === plan.planKey ? 'Ładowanie...' : `Wybierz ${plan.name}`}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* CHECKBOX REGULAMIN */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 40px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '16px 20px', background: termsAccepted ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${termsAccepted ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, transition: 'all 0.2s' }}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 2, accentColor: '#6366f1', flexShrink: 0, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 14, color: 'rgba(240,240,245,0.65)', lineHeight: 1.6 }}>
            Zapoznałem/am się z{' '}
            <Link href="/terms" target="_blank" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>Regulaminem</Link>
            {' '}i{' '}
            <Link href="/privacy" target="_blank" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>Polityką prywatności</Link>
            {' '}serwisu PostujTo i akceptuję ich treść. Wyrażam zgodę na natychmiastowe rozpoczęcie świadczenia usługi i przyjmuję do wiadomości, że po uruchomieniu subskrypcji tracę prawo do odstąpienia od umowy zgodnie z art. 38 pkt 13 ustawy o prawach konsumenta.
          </span>
        </label>
      </div>

      {/* COMPARISON TABLE */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 100px' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 48 }}>
          Starter vs <span className="gradient-text">Pro</span>
        </h2>
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ padding: '20px 28px' }} />
            {['Starter', 'Pro'].map((plan, i) => (
              <div key={i} style={{ padding: '20px 24px', textAlign: 'center', background: i === 1 ? 'rgba(99,102,241,0.1)' : 'transparent', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{plan}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#f0f0f5' }}>{i === 0 ? '79' : '199'} <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(240,240,245,0.4)' }}>zł/msc</span></p>
              </div>
            ))}
          </div>
          {[
            { feature: 'Generowanie postów', starter: 'Unlimited', pro: 'Unlimited' },
            { feature: 'Platformy', starter: 'FB / IG / TikTok', pro: 'FB / IG / TikTok' },
            { feature: 'Brand Kit (kolory, ton)', starter: '✓', pro: '✓' },
            { feature: 'Głos marki', starter: '✓', pro: '✓' },
            { feature: 'Kalendarz treści', starter: '✓', pro: '✓' },
            { feature: 'Historia postów', starter: '✓', pro: '✓' },
            { feature: 'Generowanie obrazów AI', starter: 'Ręcznie (1 obraz)', pro: 'Auto 3 obrazy' },
            { feature: 'Podpis marki na obrazach', starter: '✗', pro: '✓' },
            { feature: 'Priorytetowe generowanie', starter: '✗', pro: '✓' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', borderBottom: i < 8 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ padding: '16px 28px', fontSize: 14, color: 'rgba(240,240,245,0.65)' }}>{row.feature}</div>
              {[row.starter, row.pro].map((val, j) => (
                <div key={j} style={{ padding: '16px 24px', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.06)', background: j === 1 ? 'rgba(99,102,241,0.05)' : 'transparent', fontSize: 14, fontWeight: val === '✓' ? 700 : 400, color: val === '✓' ? '#4ade80' : val === '✗' ? 'rgba(240,240,245,0.2)' : 'rgba(240,240,245,0.7)' }}>
                  {val}
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '20px 0' }}>
            <div />
            {[{ plan: 'standard', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD }, { plan: 'premium', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM }].map((p, i) => (
              <div key={i} style={{ padding: '0 24px', borderLeft: '1px solid rgba(255,255,255,0.06)', background: i === 1 ? 'rgba(99,102,241,0.05)' : 'transparent' }}>
                <button
                  className={i === 1 ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100%', padding: '11px', borderRadius: 10, fontSize: 13 }}
                  onClick={() => p.priceId && handleSubscribe(p.priceId, p.plan)}
                >
                  {i === 0 ? 'Wybierz Starter' : 'Wybierz Pro'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div style={{ textAlign: 'center', padding: '0 24px 60px', color: 'rgba(240,240,245,0.35)', fontSize: 14 }}>
        Bezpieczne płatności przez Stripe • Anuluj w każdej chwili • Ceny w PLN z VAT
      </div>
    </div>
  );
}