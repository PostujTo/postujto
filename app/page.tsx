'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #f0f0f5; overflow-x: hidden; }

        .font-display { font-family: 'Poppins', sans-serif; }

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
          transition: all 0.4s ease;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-secondary" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  Zaloguj się
                </button>
              </SignInButton>
              <Link href="/app">
                <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  <span>Wypróbuj za darmo →</span>
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  <span>Otwórz generator →</span>
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

      {/* TICKER */}
      <div style={{ background: 'rgba(99,102,241,0.12)', borderTop: '1px solid rgba(99,102,241,0.2)', borderBottom: '1px solid rgba(99,102,241,0.2)', padding: '14px 0', overflow: 'hidden' }}>
        <div className="animate-ticker" style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', width: 'max-content' }}>
          {Array(2).fill(['Facebook', 'Instagram', 'TikTok', 'Brand Kit', 'AI Obrazy', 'Polskie Okazje', 'Kalendarz Treści', '30 postów w 5 minut', 'Podpis Marki', '12 Branż', 'Guest Mode']).flat().map((item, i) => (
            <span key={i} style={{ fontSize: 13, color: 'rgba(165,180,252,0.8)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 48 }}>
              {item} <span style={{ color: 'rgba(99,102,241,0.4)' }}>◆</span>
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
              {
                step: '01',
                title: 'Ustaw markę',
                desc: 'Wpisz nazwę firmy, wybierz branżę i ustaw kolory w Brand Kit. Zrób to raz — AI zawsze będzie pisać w Twoim stylu.',
                icon: '🎨',
                delay: 0,
              },
              {
                step: '02',
                title: 'Wpisz temat',
                desc: 'Podaj o czym ma być post lub wybierz z kalendarza polskich okazji. AI dobiera ton, długość i platformę.',
                icon: '✍️',
                delay: 0.15,
              },
              {
                step: '03',
                title: 'Publikuj',
                desc: 'Dostaniesz 3 gotowe wersje tekstu z hashtagami i grafiką AI. Kopiuj i wrzucaj bezpośrednio na platformy.',
                icon: '🚀',
                delay: 0.3,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`section-reveal from-up ${isVisible('how') ? 'visible' : ''}`}
                style={{ transitionDelay: `${item.delay}s` }}
              >
                <div className="card-glass" style={{ borderRadius: 20, padding: 36, height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div className="step-number">{item.step}</div>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{item.icon}</div>
                  </div>
                  <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.01em' }}>{item.title}</h3>
                  <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.55)', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
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

      {/* PRICING */}
      <section style={{ padding: '100px 24px' }} id="pricing" data-animate>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className={`section-reveal from-up ${isVisible('pricing') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 16 }}>Cennik</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Proste ceny,<br /><span className="gradient-text">bez ukrytych kosztów</span>
            </h2>
            <p style={{ marginTop: 16, color: 'rgba(240,240,245,0.5)', fontSize: 16 }}>7-dniowa gwarancja zwrotu. Anulujesz jednym kliknięciem.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 960, margin: '0 auto' }}>
            {[
              {
                name: 'Free',
                price: '0',
                period: 'jednorazowo',
                desc: 'Wypróbuj bez rejestracji',
                features: ['1 post bez logowania', '5 postów po rejestracji', 'Facebook, Instagram, TikTok', 'Wszystkie branże'],
                cta: 'Zacznij za darmo',
                href: '/app',
                featured: false,
              },
              {
                name: 'Starter',
                price: '79',
                period: '/ miesiąc',
                desc: 'Dla aktywnych firm',
                features: ['Unlimited postów', 'Generowanie obrazów AI', 'Brand Kit', 'Historia i ulubione', 'Kalendarz polskich okazji'],
                cta: 'Wybierz Starter',
                href: '/app',
                featured: true,
                badge: 'NAJPOPULARNIEJSZY',
              },
              {
                name: 'Pro',
                price: '199',
                period: '/ miesiąc',
                desc: 'Dla agencji i power userów',
                features: ['Wszystko ze Starter', 'Auto 3 obrazy przy każdym poście', 'Podpis marki na obrazach', 'Priorytetowe generowanie'],
                cta: 'Wybierz Pro',
                href: '/app',
                featured: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`pricing-card section-reveal from-up card-glass ${plan.featured ? 'featured' : ''} ${isVisible('pricing') ? 'visible' : ''}`}
                style={{ borderRadius: 20, padding: 36, border: '1px solid rgba(255,255,255,0.08)', transitionDelay: `${i * 0.1}s`, position: 'relative' }}
              >
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '5px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'white', whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <span className="font-display" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{plan.name}</span>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <span className="font-display" style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0f5' }}>{plan.price} <span style={{ fontSize: 18 }}>zł</span></span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', marginBottom: 8 }}>{plan.period}</div>
                <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.55)', marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{plan.desc}</div>
                <ul style={{ listStyle: 'none', marginBottom: 32 }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 14, color: 'rgba(240,240,245,0.7)' }}>
                      <span style={{ color: '#6366f1', flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <button
                    className={plan.featured ? 'btn-primary' : 'btn-secondary'}
                    style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, cursor: 'pointer', fontWeight: 600 }}
                  >
                    <span>{plan.cta}</span>
                  </button>
                </Link>
              </div>
            ))}
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
              © 2025 PostujTo.com · Wykonane z ❤️ w Polsce
            </p>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { label: 'Generator', href: '/app' },
              { label: 'Cennik', href: '#pricing' },
              { label: 'Dashboard', href: '/dashboard' },
            ].map(link => (
              <Link key={link.label} href={link.href} style={{ fontSize: 14, color: 'rgba(240,240,245,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#a5b4fc'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(240,240,245,0.4)'}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}