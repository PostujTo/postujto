'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { TermsCheckbox } from '@/components/TermsCheckbox';

import { INDUSTRIES } from '@/lib/constants';

const TONES = [
  { id: 'professional', label: 'Profesjonalny', emoji: '💼', desc: 'Formalny, biznesowy, budujący zaufanie' },
  { id: 'casual', label: 'Swobodny', emoji: '😊', desc: 'Przyjazny, bliski, jak rozmowa ze znajomym' },
  { id: 'humorous', label: 'Humorystyczny', emoji: '😄', desc: 'Lekki, zabawny, zapamiętywalny' },
  { id: 'sales', label: 'Sprzedażowy', emoji: '🛒', desc: 'Przekonujący, nakierowany na zakup' },
];

const PLATFORM_ICONS: Record<string, React.ReactElement> = {
  facebook: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  ),
  instagram: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="url(#ig)"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="25%" stopColor="#e6683c"/><stop offset="50%" stopColor="#dc2743"/><stop offset="75%" stopColor="#cc2366"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  ),
  tiktok: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
  ),
};

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', desc: 'Dłuższe posty, społeczność, zasięg organiczny' },
  { id: 'instagram', label: 'Instagram', desc: 'Wizualny, krótkie opisy, hashtagi, Stories' },
  { id: 'tiktok', label: 'TikTok', desc: 'Krótkie, chwytliwe opisy do wideo' },
];

const STEPS = ['Witaj', 'Firma', 'Platformy', 'Ton', 'Start'];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          tone: selectedTone ?? 'professional',
          style: 'realistic',
          colors: ['', '', '', '', ''],
          slogan: '',
          logo_url: '',
          sample_posts: '',
          platforms: selectedPlatforms,
        }),
      });

      // Zapisz ukończenie onboardingu
      await fetch('/api/onboarding-complete', { method: 'POST' });
      if (termsAccepted) {
        await fetch('/api/user/accept-terms', { method: 'POST' });
      }
    } catch (err) {
      console.error(err);
    }

    // Redirect do generatora z pre-wypełnionym tematem
    const industryObj = INDUSTRIES.find(i => i.id === selectedIndustry);
    const topic = industryObj ? `Przedstaw ofertę firmy ${companyName || ''} z branży ${industryObj.label}`.trim() : '';
    const platform = selectedPlatforms[0] || 'facebook';
    router.push(`/app?topic=${encodeURIComponent(topic)}&platform=${platform}&tone=${selectedTone}&onboarding=1`);
  };

  const canNext = () => {
  if (step === 1) return true;
  if (step === 2) return selectedPlatforms.length > 0;
  if (step === 3) return selectedTone !== null;
  return true;
};

  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-dm-sans), sans-serif; background: #0a0a0f; color: #f0f0f5; min-height: 100vh; }
        .font-family: var(--font-poppins), sans-serif;

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .step-enter { animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fade-up { animation: fadeUp 0.5s ease-out forwards; }

        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .option-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; cursor: pointer; transition: all 0.2s ease; }
        .option-card:hover { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
        .option-card.selected { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.6); }

        .btn-primary { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; border: none; cursor: pointer; var(--font-poppins), sans-serif; font-weight: 600; transition: all 0.25s ease; }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; filter: none; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,240,245,0.7); cursor: pointer; font-family: var(--font-dm-sans), sans-serif; transition: all 0.2s; }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); color: #f0f0f5; }

        input.input-dark { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #f0f0f5; outline: none; font-family: var(--font-dm-sans), sans-serif; transition: all 0.25s; }
        input.input-dark::placeholder { color: rgba(240,240,245,0.25); }
        input.input-dark:focus { background: rgba(255,255,255,0.07); border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

        {/* Logo */}
        <div className="fade-up" style={{ marginBottom: 48 }}>
          <span className="font-display" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Postuj<span className="gradient-text">To</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="fade-up" style={{ width: '100%', maxWidth: 560, marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: "'Poppins', sans-serif", transition: 'all 0.3s', background: i < step ? 'linear-gradient(135deg, #6366f1, #a855f7)' : i === step ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)', border: i === step ? '2px solid rgba(99,102,241,0.8)' : '2px solid transparent', color: i <= step ? '#f0f0f5' : 'rgba(240,240,245,0.3)' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === step ? '#a5b4fc' : 'rgba(240,240,245,0.3)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / (STEPS.length - 1)) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 100, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Card */}
        <div key={step} className="step-enter" style={{ width: '100%', maxWidth: 560, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px 40px 36px', backdropFilter: 'blur(20px)' }}>

          {/* STEP 0 — Witaj */}
          {step === 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>👋</div>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>
                Witaj{user?.firstName ? `, ${user.firstName}` : ''}!
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.5)', lineHeight: 1.7, marginBottom: 32 }}>
                Skonfigurujemy PostujTo pod Twoją firmę w ciągu <strong style={{ color: '#a5b4fc' }}>2 minut</strong>. Dzięki temu Claude będzie generował posty idealnie dopasowane do Twojego biznesu.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 36 }}>
                {[
                  { emoji: '🎯', label: 'Dopasowane posty', desc: 'Do Twojej branży i stylu' },
                  { emoji: '⚡', label: '30 sekund', desc: 'Na gotowy post AI' },
                  { emoji: '🇵🇱', label: 'Po polsku', desc: 'Z polskim prawem reklamowym' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '16px 12px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{item.emoji}</div>
                    <p className="font-display" style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: '#f0f0f5' }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
              <TermsCheckbox accepted={termsAccepted} onAccept={setTermsAccepted} />
              <button onClick={() => setStep(1)} disabled={!termsAccepted} className="btn-primary" style={{ width: '100%', padding: '15px', borderRadius: 14, fontSize: 16, marginTop: 16, background: termsAccepted ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)', color: termsAccepted ? '#fff' : 'rgba(240,240,245,0.3)', border: 'none', fontWeight: 700, cursor: termsAccepted ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease' }}>
                <span>Zaczynamy!</span>
              </button>
              <button onClick={() => router.push('/app')} style={{ marginTop: 14, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(240,240,245,0.3)', fontFamily: "'DM Sans', sans-serif" }}>
                Pomiń konfigurację
              </button>
            </div>
          )}

          {/* STEP 1 — Nazwa firmy + branża */}
          {step === 1 && (
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Twoja firma</h2>
              <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)', marginBottom: 28 }}>Podaj nazwę i wybierz branżę — to pomoże Claude pisać trafniej.</p>

              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,240,245,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Nazwa firmy</label>
              <input
                className="input-dark"
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="np. Piekarnia Kowalski, Studio Urody Maya..."
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 15, marginBottom: 24 }}
              />

              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,240,245,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Branża <span style={{ fontWeight: 400, color: 'rgba(240,240,245,0.25)' }}>(opcjonalnie)</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                {INDUSTRIES.map(ind => (
                  <button key={ind.id} onClick={() => setSelectedIndustry(selectedIndustry === ind.id ? null : ind.id)}
                    className={`option-card ${selectedIndustry === ind.id ? 'selected' : ''}`}
                    style={{ padding: '12px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 22 }}>{ind.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: selectedIndustry === ind.id ? '#a5b4fc' : 'rgba(240,240,245,0.65)', lineHeight: 1.3 }}>{ind.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Platformy */}
          {step === 2 && (
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Gdzie publikujesz?</h2>
              <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)', marginBottom: 28 }}>Wybierz platformy na których jesteś aktywny. Możesz wybrać kilka.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PLATFORMS.map(p => {
                  const selected = selectedPlatforms.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => togglePlatform(p.id)}
                      className={`option-card ${selected ? 'selected' : ''}`}
                      style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}>
                      <div style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {PLATFORM_ICONS[p.id]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 3, color: selected ? '#a5b4fc' : '#f0f0f5' }}>{p.label}</p>
                        <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)' }}>{p.desc}</p>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: selected ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.06)', border: selected ? 'none' : '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', transition: 'all 0.2s' }}>
                        {selected ? '✓' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — Ton */}
          {step === 3 && (
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Jak komunikujesz się z klientami?</h2>
              <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)', marginBottom: 28 }}>Wybierz ton który najlepiej pasuje do Twojej marki.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setSelectedTone(t.id)}
                    className={`option-card ${selectedTone === t.id ? 'selected' : ''}`}
                    style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{t.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, color: selectedTone === t.id ? '#a5b4fc' : '#f0f0f5' }}>{t.label}</p>
                      <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)' }}>{t.desc}</p>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: selectedTone === t.id ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.06)', border: selectedTone === t.id ? 'none' : '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', transition: 'all 0.2s' }}>
                      {selectedTone === t.id ? '✓' : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Start */}
          {step === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
              <h2 className="font-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 14 }}>Gotowe!</h2>
              <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.5)', lineHeight: 1.7, marginBottom: 28 }}>
                Twój Brand Kit jest skonfigurowany. Możesz teraz zacząć generować posty dopasowane do Twojej firmy.
              </p>
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Twoja konfiguracja</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {companyName && <div style={{ display: 'flex', gap: 10, fontSize: 14 }}><span style={{ color: 'rgba(240,240,245,0.35)' }}>Firma:</span><span style={{ color: '#f0f0f5', fontWeight: 600 }}>{companyName}</span></div>}
                  {selectedIndustry && <div style={{ display: 'flex', gap: 10, fontSize: 14 }}><span style={{ color: 'rgba(240,240,245,0.35)' }}>Branża:</span><span style={{ color: '#f0f0f5', fontWeight: 600 }}>{INDUSTRIES.find(i => i.id === selectedIndustry)?.emoji} {INDUSTRIES.find(i => i.id === selectedIndustry)?.label}</span></div>}
                  <div style={{ display: 'flex', gap: 10, fontSize: 14 }}>
                    <span style={{ color: 'rgba(240,240,245,0.35)' }}>Platformy:</span>
                    <span style={{ color: '#f0f0f5', fontWeight: 600, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {selectedPlatforms.map(p => {
                        const pl = PLATFORMS.find(pl => pl.id === p);
                        return pl ? (
                          <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>{PLATFORM_ICONS[p]}</span>
                            {pl.label}
                          </span>
                        ) : null;
                      })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 14 }}><span style={{ color: 'rgba(240,240,245,0.35)' }}>Ton:</span><span style={{ color: '#f0f0f5', fontWeight: 600 }}>{TONES.find(t => t.id === selectedTone)?.emoji} {TONES.find(t => t.id === selectedTone)?.label}</span></div>
                </div>
              </div>
              <button onClick={handleFinish} disabled={saving} className="btn-primary" style={{ width: '100%', padding: '15px', borderRadius: 14, fontSize: 16, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: saving ? 'not-allowed' : 'pointer' }}>
              <span>{saving ? '⏳ Zapisuję...' : '✨ Przejdź do generatora'}</span>
            </button>
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.7)', marginBottom: 6 }}>
                💡 <strong style={{ color: '#f0f0f5' }}>Chcesz lepsze posty?</strong>
              </p>
              <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.45)', lineHeight: 1.5 }}>
                Dodaj logo i przykładowe posty w{' '}
                <a href="/settings" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>Brand Kit</a>
                {' '}— Claude będzie pisał bardziej w Twoim stylu.
              </p>
            </div>
            </div>
          )}

          {/* Navigation buttons (steps 1-3) */}
          {step >= 1 && step <= 3 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
            <button onClick={() => setStep(s => s - 1)} className="btn-ghost" style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14 }}>
              ← Wróć
            </button>
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary" style={{ padding: '12px 32px', borderRadius: 12, fontSize: 14, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', fontWeight: 700, cursor: canNext() ? 'pointer' : 'not-allowed' }}>
              <span>{step === 3 ? 'Zakończ konfigurację' : 'Dalej'}</span>
            </button>
          </div>
          )}
        </div>

        <p className="fade-up" style={{ marginTop: 24, fontSize: 12, color: 'rgba(240,240,245,0.2)', textAlign: 'center' }}>
          Możesz zmienić te ustawienia później w <span style={{ color: 'rgba(165,180,252,0.5)' }}>Brand Kit</span>
        </p>
      </div>
    </>
  );
}
