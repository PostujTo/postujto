'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppHeader } from '@/components/AppHeader';
import Link from 'next/link';

const BRAND_STYLES = [
  { id: 'realistic', label: 'Realistyczny', desc: 'Fotorealistyczne zdjęcia produktów i ludzi' },
  { id: 'minimalist', label: 'Minimalistyczny', desc: 'Proste, czyste kompozycje' },
  { id: 'colorful', label: 'Kolorowy', desc: 'Żywe, przyciągające uwagę grafiki' },
  { id: 'elegant', label: 'Elegancki', desc: 'Luksusowy, wyrafinowany styl' },
  { id: 'rustic', label: 'Rustykalny', desc: 'Naturalny, domowy, handmade styl' },
  { id: 'modern', label: 'Nowoczesny', desc: 'Geometryczny, technologiczny wygląd' },
  { id: 'playful', label: 'Zabawowy', desc: 'Wesoły, kreskówkowy, młodzieżowy' },
];

const BRAND_TONES = [
  { id: 'professional', label: 'Profesjonalny' },
  { id: 'casual', label: 'Swobodny' },
  { id: 'humorous', label: 'Humorystyczny' },
  { id: 'sales', label: 'Sprzedażowy' },
];

const STYLE_PRESETS = [
  {
    id: 'local',
    label: 'Lokalny biznes',
    emoji: '🏪',
    desc: 'Ciepły, swojski klimat. Dla restauracji, sklepów, rzemiosła.',
    style: 'rustic',
    tone: 'casual',
    colors: ['#8B4513', '#D2691E', '#F4A460', '#FFEFD5', '#228B22'],
  },
  {
    id: 'corporate',
    label: 'Korporacja',
    emoji: '🏢',
    desc: 'Poważny, profesjonalny wygląd. Dla B2B, finansów, prawa.',
    style: 'modern',
    tone: 'professional',
    colors: ['#003087', '#0052CC', '#1A73E8', '#E8F0FE', '#FFFFFF'],
  },
  {
    id: 'eco',
    label: 'Eko / Natura',
    emoji: '🌿',
    desc: 'Zielony, naturalny klimat. Dla produktów organic, wellness.',
    style: 'realistic',
    tone: 'casual',
    colors: ['#2D6A4F', '#40916C', '#74C69D', '#D8F3DC', '#F8F9FA'],
  },
  {
    id: 'premium',
    label: 'Premium / Luksus',
    emoji: '✨',
    desc: 'Elegancki, ekskluzywny styl. Dla biżuterii, mody, hoteli.',
    style: 'elegant',
    tone: 'professional',
    colors: ['#1A1A1A', '#C9A84C', '#F5E6C8', '#FFFFFF', '#8B7355'],
  },
  {
    id: 'youth',
    label: 'Młodzieżowy',
    emoji: '🎉',
    desc: 'Energiczny, kolorowy. Dla marek skierowanych do Gen Z.',
    style: 'playful',
    tone: 'humorous',
    colors: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'],
  },
  {
    id: 'minimal',
    label: 'Minimalizm',
    emoji: '◻️',
    desc: 'Czysty, prosty design. Dla technologii, architektury, designu.',
    style: 'minimalist',
    tone: 'professional',
    colors: ['#000000', '#333333', '#666666', '#CCCCCC', '#FFFFFF'],
  },
];

export default function SettingsPage() {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [portalLoading, setPortalLoading] = useState(false);
  const [magicInput, setMagicInput] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicError, setMagicError] = useState('');
  const [magicDone, setMagicDone] = useState(false);
  const [brandKit, setBrandKit] = useState({
    company_name: '',
    colors: ['', '', '', '', ''] as string[],
    style: 'realistic',
    tone: 'professional',
    slogan: '',
    logo_url: '',
    sample_posts: '',
    platforms: [] as string[],
    length: 'medium',
  });

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/plan').then(r => r.json()).then(d => setCurrentPlan(d.plan || 'free'));
    fetch('/api/brand-kit')
      .then(r => r.json())
      .then(data => {
        if (data.brandKit) {
          setBrandKit({
            company_name: data.brandKit.company_name || '',
            colors: Array(5).fill('').map((_, i) => (data.brandKit.colors || [])[i] || ''),
            style: data.brandKit.style || 'realistic',
            tone: data.brandKit.tone || 'professional',
            slogan: data.brandKit.slogan || '',
            logo_url: data.brandKit.logo_url || '',
            sample_posts: data.brandKit.sample_posts || '',
            platforms: data.brandKit.platforms || [],
            length: data.brandKit.length || 'medium',
          });
        }
      });
  }, [user]);

  const VALID_INDUSTRY_IDS = ['restaurant','catering','bakery','food','beauty','hairdresser','fitness','medical','veterinary','fashion','ecommerce','crafts','florist','construction','carpenter','photography','automotive','tutoring','education','realestate','tourism'];
  const VALID_TONE_IDS = ['professional','casual','humorous','sales'];

  const handleMagicImport = async () => {
    if (!magicInput.trim()) return;

    const RATE_KEY = 'magic_import_attempts';
    const RATE_WINDOW = 60 * 60 * 1000;
    const now = Date.now();
    const stored: number[] = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem(RATE_KEY) || '[]' : '[]');
    const recent = stored.filter(ts => now - ts < RATE_WINDOW);
    if (recent.length >= 5) {
      setMagicError('Przekroczono limit prób. Spróbuj za godzinę lub wpisz dane ręcznie.');
      return;
    }

    setMagicLoading(true);
    setMagicError('');

    try {
      const res = await fetch('/api/onboarding/magic-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: magicInput }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMagicError(data.error || 'Coś poszło nie tak.');
        return;
      }

      setBrandKit(prev => ({
        ...prev,
        ...(data.name ? { company_name: data.name } : {}),
        ...(data.slogan ? { slogan: data.slogan } : {}),
        ...(data.tone && VALID_TONE_IDS.includes(data.tone) ? { tone: data.tone } : {}),
      }));

      if (typeof window !== 'undefined') {
        localStorage.setItem(RATE_KEY, JSON.stringify([...recent, now]));
      }

      setMagicDone(true);
    } catch {
      setMagicError('Błąd połączenia. Spróbuj opisać firmę ręcznie.');
    } finally {
      setMagicLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/customer-portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch('/api/brand-kit/upload-logo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.logo_url) {
        setBrandKit(prev => ({ ...prev, logo_url: data.logo_url }));
      } else {
        alert(data.error || 'Błąd uploadu');
      }
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandKit),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const bkFields = [
    { key: 'company_name' as keyof typeof brandKit, label: 'Nazwa firmy', weight: 30 },
    { key: 'sample_posts' as keyof typeof brandKit, label: 'Przykładowe posty', weight: 30 },
    { key: 'logo_url' as keyof typeof brandKit, label: 'Logo', weight: 15 },
    { key: 'colors' as keyof typeof brandKit, label: 'Kolory marki', weight: 15 },
    { key: 'tone' as keyof typeof brandKit, label: 'Ton komunikacji', weight: 10 },
  ];
  const isBkFilled = (key: string, val: unknown): boolean => {
    if (key === 'colors') return Array.isArray(val) ? (val as string[]).some(c => c && c !== '#000000' && c !== '') : !!val;
    return !!val && val !== '';
  };
  const completeness = bkFields.reduce((sum, f) => {
    return isBkFilled(f.key, brandKit[f.key]) ? sum + f.weight : sum;
  }, 0);
  const missing = bkFields.filter(f => !isBkFilled(f.key, brandKit[f.key])).map(f => f.label);

  const s = {
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 20 } as React.CSSProperties,
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(240,240,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 } as React.CSSProperties,
    input: { width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#f0f0f5', fontSize: 15, fontWeight: 500, outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: '"DM Sans", sans-serif', color: '#f0f0f5' }}>
      <AppHeader activePage="settings" credits={{ plan: currentPlan, remaining: 0, total: 0 }} onPortalClick={handlePortal} portalLoading={portalLoading} />

      <div className="settings-content" style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 32, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Brand</span> Kit
          </h1>
          <p style={{ color: 'rgba(240,240,245,0.4)', fontSize: 15 }}>Skonfiguruj styl komunikacji swojej firmy</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Magic Import */}
          <div style={{ ...s.card, border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: '#a5b4fc' }}>✨ Auto-uzupełnij Brand Kit</p>
            <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.5)', marginBottom: 12, lineHeight: 1.5 }}>
              Wklej link do swojej strony www lub opisz firmę — Claude uzupełni nazwę, slogan i ton.
            </p>
            <textarea
              placeholder="np. https://twoja-firma.pl lub opisz firmę własnymi słowami..."
              value={magicInput}
              onChange={e => setMagicInput(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, resize: 'vertical', marginBottom: 10, boxSizing: 'border-box', lineHeight: 1.5, fontFamily: '"DM Sans", sans-serif' } as React.CSSProperties}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              <button
                onClick={handleMagicImport}
                disabled={magicLoading || !magicInput.trim()}
                className="btn-primary"
                style={{ padding: '9px 16px', fontSize: 13, borderRadius: 8, opacity: (!magicInput.trim() || magicLoading) ? 0.5 : 1, cursor: (!magicInput.trim() || magicLoading) ? 'not-allowed' : 'pointer' }}
              >
                {magicLoading ? '⏳ Analizuję...' : '✨ Uzupełnij automatycznie'}
              </button>
            </div>
            {magicError && <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>⚠️ {magicError}</p>}
            {magicDone && !magicError && <p style={{ fontSize: 12, color: '#4ade80', marginTop: 8 }}>✓ Pola zaktualizowane! Sprawdź poniżej i zapisz.</p>}
          </div>

          {/* Kompletność */}
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(240,240,245,0.8)' }}>Kompletność Brand Kitu</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: completeness >= 80 ? '#4ade80' : completeness >= 50 ? '#fbbf24' : '#f87171' }}>{completeness}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 100 }}>
              <div style={{ height: '100%', borderRadius: 100, transition: 'width 0.4s ease', width: completeness + '%', background: completeness >= 80 ? 'linear-gradient(90deg,#4ade80,#22c55e)' : completeness >= 50 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : 'linear-gradient(90deg,#f87171,#ef4444)' }} />
            </div>
            {missing.length > 0 && <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.3)', marginTop: 8 }}>Brakuje: {missing.join(', ')}</p>}
            {completeness === 100 && <p style={{ fontSize: 12, fontWeight: 600, marginTop: 8, color: '#4ade80' }}>✅ Brand Kit w pełni skonfigurowany!</p>}
          </div>

          {/* Presety */}
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Zacznij od presetu</p>
            <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', marginBottom: 16 }}>Wybierz szablon jako punkt startowy — możesz go potem edytować.</p>
            <div className="settings-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {STYLE_PRESETS.map(preset => (
                <button key={preset.id}
                  onClick={() => setBrandKit(prev => ({ ...prev, style: preset.style, tone: preset.tone, colors: preset.colors }))}
                  style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{preset.emoji}</span>
                    <span style={{ fontWeight: 700, color: '#f0f0f5', fontSize: 13 }}>{preset.label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)', marginBottom: 8 }}>{preset.desc}</p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {preset.colors.map((col, i) => (
                      <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: col }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nazwa firmy */}
          <div style={s.card}>
            <label style={s.label}>Nazwa firmy</label>
            <input
              type="text"
              value={brandKit.company_name}
              onChange={e => setBrandKit(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="np. Prujka Hand Made, Restauracja u Kowalskiego..."
              spellCheck={false}
              style={s.input}
            />
          </div>

          {/* Slogan */}
          <div style={s.card}>
            <label style={s.label}>Slogan <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', fontSize: 11 }}>(opcjonalnie)</span></label>
            <input
              type="text"
              value={brandKit.slogan}
              onChange={e => setBrandKit(prev => ({ ...prev, slogan: e.target.value }))}
              placeholder="np. Jakość z pasji, Smak tradycji..."
              spellCheck={false}
              style={s.input}
            />
          </div>

          {/* Kolory marki */}
          <div style={s.card}>
            <label style={s.label}>Kolory marki <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', fontSize: 11 }}>(max 5 — HEX, RGB lub CMYK)</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0, 1, 2, 3, 4].map(idx => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', backgroundColor: brandKit.colors[idx] || 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={brandKit.colors[idx] || ''}
                    onChange={e => {
                      const newColors = Array(5).fill('').map((_, i) => brandKit.colors[i] || '');
                      newColors[idx] = e.target.value;
                      setBrandKit(prev => ({ ...prev, colors: newColors }));
                    }}
                    placeholder={`Kolor ${idx + 1} — np. #E31E24`}
                    spellCheck={false}
                    style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f0f0f5', fontSize: 13, fontFamily: 'monospace', outline: 'none' }}
                  />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.25)', marginTop: 8 }}>Podgląd koloru pojawi się automatycznie po wpisaniu prawidłowej wartości HEX</p>
          </div>

          {/* Styl marki */}
          <div style={s.card}>
            <label style={{ ...s.label, marginBottom: 12 }}>Styl graficzny marki</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {BRAND_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => setBrandKit(prev => ({ ...prev, style: style.id }))}
                  style={{ padding: '14px 16px', borderRadius: 14, border: brandKit.style === style.id ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)', background: brandKit.style === style.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ fontWeight: 700, color: brandKit.style === style.id ? '#a78bfa' : '#f0f0f5', fontSize: 13, marginBottom: 4 }}>{style.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)' }}>{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Ton komunikacji */}
          <div style={s.card}>
            <label style={{ ...s.label, marginBottom: 12 }}>Ton komunikacji</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {BRAND_TONES.map(tone => (
                <button
                  key={tone.id}
                  onClick={() => setBrandKit(prev => ({ ...prev, tone: tone.id }))}
                  style={{ padding: '10px 22px', borderRadius: 50, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', background: brandKit.tone === tone.id ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)', border: brandKit.tone === tone.id ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)', color: brandKit.tone === tone.id ? '#fff' : 'rgba(240,240,245,0.6)' }}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Długość postów */}
          <div style={s.card}>
            <label style={{ ...s.label, marginBottom: 12 }}>Domyślna długość postów</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { value: 'short', label: 'Krótki', desc: '~100 słów' },
                { value: 'medium', label: 'Średni', desc: '~250 słów' },
                { value: 'long', label: 'Długi', desc: '~500 słów' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setBrandKit(prev => ({ ...prev, length: opt.value }))}
                  style={{ padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: brandKit.length === opt.value ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)', border: brandKit.length === opt.value ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)', color: brandKit.length === opt.value ? '#fff' : 'rgba(240,240,245,0.6)' }}
                >
                  {opt.label}
                  <span style={{ fontSize: 11, display: 'block', opacity: 0.6, fontWeight: 400 }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platformy */}
          <div style={s.card}>
            <label style={{ ...s.label, marginBottom: 12 }}>Aktywne platformy</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {(['facebook', 'instagram', 'tiktok'] as const).map(pl => {
                const labels = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok' };
                const isSelected = brandKit.platforms.includes(pl);
                return (
                  <button
                    key={pl}
                    onClick={() => setBrandKit(prev => ({
                      ...prev,
                      platforms: isSelected
                        ? prev.platforms.filter(p => p !== pl)
                        : [...prev.platforms, pl],
                    }))}
                    style={{ padding: '10px 22px', borderRadius: 50, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', background: isSelected ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)', border: isSelected ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)', color: isSelected ? '#fff' : 'rgba(240,240,245,0.6)' }}
                  >
                    {labels[pl]}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.35)', marginTop: 10 }}>
              Kalendarz treści będzie generował posty tylko na wybrane platformy.
            </p>
          </div>

          {/* Logo */}
          <div style={s.card}>
            <label style={s.label}>Logo <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', fontSize: 11 }}>(opcjonalnie — PNG, JPG, SVG, max 2MB)</span></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {brandKit.logo_url && (
                <div style={{ width: 80, height: 80, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={brandKit.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                </div>
              )}
              <div>
                <label style={{ cursor: 'pointer', padding: '10px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: 'rgba(240,240,245,0.7)', display: 'inline-block', transition: 'all 0.2s' }}>
                  {uploadingLogo ? '⏳ Przesyłam...' : brandKit.logo_url ? '🔄 Zmień logo' : '📁 Wgraj logo'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingLogo}
                  />
                </label>
                {brandKit.logo_url && (
                  <button
                    onClick={() => setBrandKit(prev => ({ ...prev, logo_url: '' }))}
                    style={{ marginLeft: 12, fontSize: 13, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Usuń logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Przykładowe posty */}
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,240,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Przykładowe posty <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', fontSize: 11 }}>(opcjonalnie)</span>
              </label>
              <button onClick={() => setShowTip(!showTip)} style={{ fontSize: 11, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                {showTip ? 'Ukryj wskazówki' : '💡 Jak to wypełnić?'}
              </button>
            </div>
            {showTip && (
              <div style={{ marginBottom: 12, padding: 14, borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.6)', marginBottom: 8, lineHeight: 1.7 }}>
                  Wklej 3–5 postów które sam napisałeś i które Ci się podobają. Claude przeanalizuje Twój styl: długość zdań, użycie emoji, ton, słownictwo.
                </p>
                <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.35)', fontStyle: 'italic', lineHeight: 1.7 }}>
                  Przykład (salon fryzjerski):<br />
                  &quot;Witajcie! ✂️ Dziś chcemy pokazać Wam metamorfozę naszej Klientki Ani. Przyszła z długimi włosami — wyszła z pewnością siebie! 💪 Umów się: 📞 123 456 789&quot;
                </p>
              </div>
            )}
            {!showTip && <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.3)', marginBottom: 12 }}>Wklej 3–10 swoich najlepszych postów. Claude nauczy się Twojego stylu i będzie pisał podobnie.</p>}
            <textarea
              value={brandKit.sample_posts}
              onChange={e => setBrandKit(prev => ({ ...prev, sample_posts: e.target.value }))}
              placeholder={"Wklej tutaj swoje posty, oddzielone pustą linią:\n\nNp.:\nDziś w naszym sklepie nowa dostawa! 🎉 Sprawdź co przywieźliśmy...\n\nKażdy piątek to u nas dzień promocji. Tym razem -20% na...\n\nZa kulisami: tak wygląda nasz poranek przed otwarciem..."}
              rows={10}
              style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#f0f0f5', fontSize: 14, fontWeight: 500, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.3)' }}>
                {brandKit.sample_posts.length > 0
                  ? `✅ ${brandKit.sample_posts.split('\n\n').filter(p => p.trim()).length} postów — Claude będzie pisał w Twoim stylu`
                  : 'Brak przykładów — Claude użyje domyślnego stylu'}
              </p>
              <span style={{ fontSize: 11, color: brandKit.sample_posts.length > 9000 ? '#f87171' : 'rgba(240,240,245,0.2)' }}>
                {brandKit.sample_posts.length} / 10 000 znaków
              </span>
            </div>
          </div>


          {/* Twój plan */}
          <div style={{ ...s.card, borderColor: 'rgba(99,102,241,0.2)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Twój plan</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' as const }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f5', textTransform: 'capitalize' }}>
                  {currentPlan === 'standard' ? 'Starter' : currentPlan === 'premium' ? 'Pro' : 'Free'}
                </span>
                {currentPlan === 'free' && (
                  <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', marginTop: 4 }}>Przejdź na Starter lub Pro by odblokować unlimited generowanie</p>
                )}
              </div>
              {currentPlan !== 'free' ? (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="btn-ghost"
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, opacity: portalLoading ? 0.6 : 1 }}
                >
                  {portalLoading ? '...' : 'Zarządzaj subskrypcją →'}
                </button>
              ) : (
                <a href="/pricing" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                  Ulepsz plan →
                </a>
              )}
            </div>
          </div>

          {/* Zapisz */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', padding: 18, background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', border: 'none', borderRadius: 18, color: '#fff', fontWeight: 700, fontSize: 17, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s', fontFamily: '"Poppins", sans-serif' }}
          >
            {saving ? '⏳ Zapisuję...' : saved ? '✅ Zapisano!' : 'Zapisz Brand Kit'}
          </button>

          {/* Jak Claude widzi Twoją markę */}
          {brandKit.company_name && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,240,245,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>👁 Jak Claude widzi Twoją markę</p>
              <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.5)', fontStyle: 'italic', lineHeight: 1.8 }}>
                {'Firma: ' + brandKit.company_name + (brandKit.slogan ? ' — "' + brandKit.slogan + '"' : '') + '.'}
                {brandKit.tone ? ' Ton komunikacji: ' + brandKit.tone + '.' : ''}
                {brandKit.colors.some(col => !!col) ? ' Kolory marki: ' + brandKit.colors.filter(col => !!col).join(', ') + '.' : ''}
                {brandKit.sample_posts
                  ? ' Styl pisania: Claude przeanalizował Twoje przykładowe posty.'
                  : ' ⚠️ Brak przykładowych postów — posty będą mniej spersonalizowane.'}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
