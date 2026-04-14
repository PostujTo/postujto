'use client';
import { useState } from 'react';
import Link from 'next/link';

export function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Free',
      monthly: '0 zł',
      annual: '0 zł',
      annualNote: '',
      desc: '5 postów po rejestracji',
      color: 'rgba(255,255,255,0.06)',
      cta: 'Zacznij za darmo',
      href: '/sign-up',
      highlight: false,
    },
    {
      name: 'Starter',
      monthly: '97 zł/msc',
      annual: '830 zł/rok',
      annualNote: 'ok. 69 zł/msc • oszczędzasz ~29%',
      desc: 'Unlimited posty • Brand Kit • Kalendarz treści • Automatyczna publikacja (FB/IG/TikTok) • Integracja sklepu',
      color: 'rgba(99,102,241,0.15)',
      cta: 'Wybierz Starter',
      href: '/pricing',
      highlight: true,
    },
    {
      name: 'Pro',
      monthly: '247 zł/msc',
      annual: '2110 zł/rok',
      annualNote: 'ok. 176 zł/msc • oszczędzasz ~29%',
      desc: 'Wszystko ze Starter + AI Trend Advisor • Auto 3 obrazy AI • Podpis marki na obrazach • Audyt profilu AI • Wsparcie priorytetowe',
      color: 'rgba(168,85,247,0.1)',
      cta: 'Wybierz Pro',
      href: '/pricing',
      highlight: false,
    },
  ];

  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
      <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', marginBottom: 12, letterSpacing: '-0.01em', textAlign: 'center' }}>
        Wybierz swój plan
      </h2>

      {/* Billing toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, marginTop: 20 }}>
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 4, gap: 4 }}>
          {(['monthly', 'annual'] as const).map(option => (
            <button
              key={option}
              onClick={() => setBilling(option)}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                minHeight: 44,
                transition: 'all 0.2s',
                background: billing === option ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
                color: billing === option ? '#fff' : 'rgba(240,240,245,0.45)',
              }}
            >
              {option === 'monthly' ? 'Miesięczny' : (
                <>Roczny <span style={{ marginLeft: 4, fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 6 }}>-29%</span></>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="dla-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {plans.map(plan => (
          <div
            key={plan.name}
            style={{
              background: plan.color,
              border: plan.highlight ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '24px 20px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 4 }}>{plan.name}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: plan.highlight ? '#a5b4fc' : '#fff', marginBottom: 4 }}>
              {billing === 'monthly' ? plan.monthly : plan.annual}
            </p>
            {billing === 'annual' && plan.annualNote && (
              <p style={{ fontSize: 11, color: '#4ade80', marginBottom: 6 }}>{plan.annualNote}</p>
            )}
            <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>
            <Link
              href={plan.href}
              style={{
                display: 'block',
                padding: '10px 16px',
                background: plan.highlight ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.08)',
                borderRadius: 10,
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(240,240,245,0.3)', marginTop: 20 }}>
        Nie potrzebujesz karty — zacznij za darmo
      </p>
    </section>
  );
}
