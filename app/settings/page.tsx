'use client';

import { useState, useEffect, useRef } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { notify } from '@/lib/toast';
import { useUser } from '@clerk/nextjs';
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

interface BrandKitDB {
  company_name?: string;
  slogan?: string;
  tone?: string;
  style?: string;
  colors?: string[];
  logo_url?: string;
  usp?: string;
  pain_point?: string;
  dream_outcome?: string;
  biggest_pain?: string;
  unique_mechanism?: string;
  sample_posts?: string;
  platforms?: string[];
  length?: string;
  industry?: string;
  [key: string]: unknown;
}

export default function SettingsPage() {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [previewPost, setPreviewPost] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const tipStyle: React.CSSProperties = { position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: 6, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'rgba(240,240,245,0.75)', lineHeight: 1.6, width: 260 };
  const tipIcon: React.CSSProperties = { width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'rgba(240,240,245,0.45)', fontSize: 10, fontWeight: 700, cursor: 'help', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  const [saved, setSaved] = useState(false);
  // Raw values from DB (no React defaults) — used ONLY for completeness score
  const [dbBrandKit, setDbBrandKit] = useState<BrandKitDB>({});
  const [isEditing, setIsEditing] = useState(false); // false = VIEW, true = EDIT
  const [editSnapshot, setEditSnapshot] = useState<typeof brandKit | null>(null); // snapshot for cancel
  const editingInitialized = useRef(false); // guards against Clerk user re-renders resetting isEditing
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [isAnnual, setIsAnnual] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [ayrshareProfileKey, setAyrshareProfileKey] = useState<string | null>(null);
  const [isConnectingZernio, setIsConnectingZernio] = useState(false);
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
    tone_source: 'manual' as 'manual' | 'imported',
    usp: '',
    usp_source: 'manual' as 'manual' | 'imported',
    pain_point: '',
    pain_point_source: 'manual' as 'manual' | 'imported',
    dream_outcome: '',
    dream_outcome_source: 'manual' as 'manual' | 'imported',
    biggest_pain: '',
    unique_mechanism: '',
  });

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/plan').then(r => r.json()).then(d => { setCurrentPlan(d.plan || 'free'); setIsAnnual(d.is_annual === true); setAyrshareProfileKey(d.ayrshare_profile_key || null); });
    fetch('/api/brand-kit')
      .then(r => r.json())
      .then(data => {
        if (data.brandKit) {
          setDbBrandKit(data.brandKit); // raw from DB, no fallbacks — for completeness score
          if (!editingInitialized.current) {
            editingInitialized.current = true;
            setIsEditing(false); // always VIEW on start — user clicks Edit to begin
          }
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
            tone_source: (data.brandKit.tone_source || 'manual') as 'manual' | 'imported',
            usp: data.brandKit.usp || '',
            usp_source: (data.brandKit.usp_source || 'manual') as 'manual' | 'imported',
            pain_point: data.brandKit.pain_point || '',
            pain_point_source: (data.brandKit.pain_point_source || 'manual') as 'manual' | 'imported',
            dream_outcome: data.brandKit.dream_outcome || '',
            dream_outcome_source: (data.brandKit.dream_outcome_source || 'manual') as 'manual' | 'imported',
            biggest_pain: data.brandKit.biggest_pain || '',
            unique_mechanism: data.brandKit.unique_mechanism || '',
          });
        }
      });
  }, [user]);

  useEffect(() => {
    if (!brandKit.company_name) return;
    const timer = setTimeout(async () => {
      setIsPreviewLoading(true);
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: 'Przedstaw naszą firmę i co oferujemy',
            platform: 'facebook',
            tone: brandKit.tone || 'professional',
            length: 'short',
            isPreview: true,
            brandKitOverride: brandKit,
          }),
        });
        const data = await res.json();
        setPreviewPost(data.posts?.[0]?.text || '');
      } catch {
        // silent
      } finally {
        setIsPreviewLoading(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [brandKit]);

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
        ...(data.tone && VALID_TONE_IDS.includes(data.tone) ? { tone: data.tone, tone_source: 'imported' as const } : {}),
        ...(data.unique_mechanism ? { usp: data.unique_mechanism, usp_source: 'imported' as const } : {}),
        ...(data.pain_point ? { pain_point: data.pain_point, pain_point_source: 'imported' as const } : {}),
        ...(data.dream_outcome ? { dream_outcome: data.dream_outcome, dream_outcome_source: 'imported' as const } : {}),
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

  const handleConnectZernio = async () => {
    setIsConnectingZernio(true);
    try {
      const res = await fetch('/api/social/connect', { method: 'POST' });
      const d = await res.json();
      if (res.ok && d.profileKey) {
        setAyrshareProfileKey(d.profileKey);
      } else {
        alert(d.error || 'Błąd połączenia z Zernio');
      }
    } catch { alert('Błąd połączenia'); }
    finally { setIsConnectingZernio(false); }
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

  const handleEdit = () => {
    setEditSnapshot({ ...brandKit });
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (editSnapshot) setBrandKit(editSnapshot);
    setEditSnapshot(null);
    setIsEditing(false);
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
        setDbBrandKit({ ...brandKit }); // sync — user just saved, so DB now matches UI
        setEditSnapshot(null);
        setIsEditing(false); // back to VIEW mode after save
        notify.success('Profil Marki zapisany');
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
  // Completeness uses dbBrandKit (raw DB values), NOT brandKit state (has defaults like tone:'professional')
  const isBkFilled = (key: string): boolean => {
    const val = dbBrandKit[key];
    if (key === 'colors') return Array.isArray(val) ? (val as string[]).some(c => c && c !== '#000000' && c !== '') : !!val;
    return !!val && val !== '';
  };
  const completeness = bkFields.reduce((sum, f) => {
    return isBkFilled(f.key) ? sum + f.weight : sum;
  }, 0);
  const missing = bkFields.filter(f => !isBkFilled(f.key)).map(f => f.label);

  const s = {
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 20 } as React.CSSProperties,
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(240,240,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 } as React.CSSProperties,
    input: { width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#f0f0f5', fontSize: 15, fontWeight: 500, outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: '"DM Sans", sans-serif', color: '#f0f0f5' }}>

      <div className="settings-content" style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 32, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Brand</span> Kit
          </h1>
          <p style={{ color: 'rgba(240,240,245,0.4)', fontSize: 15 }}>Skonfiguruj styl komunikacji swojej firmy</p>
        </div>

        {!dbBrandKit.company_name && !isEditing && (
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: 16,
          }}>
            <EmptyState
              icon="🎨"
              title="Profil Twojej Firmy jest pusty"
              description="Opisz swoją firmę raz — PostujTo użyje tych informacji we wszystkich postach."
              ctaLabel="Opisz swoją firmę w 30 sekund →"
              ctaOnClick={() => setIsEditing(true)}
              secondaryLabel="Wolę wpisać ręcznie"
              secondaryHref="#manual-form"
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {isEditing && (<>

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
          </>)} {/* end Magic Import edit-only */}

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

          {/* ── VIEW MODE ── */}
          {!isEditing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Edit button */}
              <button
                onClick={handleEdit}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', padding: '10px 22px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#f0f0f5', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
              >
                ✏️ Edytuj Brand Kit
              </button>

              {/* Nazwa firmy */}
              <div style={s.card}>
                <span style={s.label}>Nazwa firmy</span>
                {dbBrandKit.company_name
                  ? <p style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f5', marginTop: 4 }}>{dbBrandKit.company_name}</p>
                  : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

              {/* Slogan */}
              <div style={s.card}>
                <span style={s.label}>Slogan</span>
                {dbBrandKit.slogan
                  ? <p style={{ fontSize: 15, color: '#f0f0f5', lineHeight: 1.5, marginTop: 4 }}>{dbBrandKit.slogan}</p>
                  : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

              {/* Ton komunikacji */}
              <div style={s.card}>
                <span style={s.label}>Ton komunikacji</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                  {BRAND_TONES.map(tone => {
                    const isActive = dbBrandKit.tone === tone.id;
                    return (
                      <span key={tone.id} style={{ padding: '8px 20px', borderRadius: 50, fontSize: 14, fontWeight: isActive ? 700 : 400, background: isActive ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.04)', border: isActive ? '1px solid transparent' : '1px solid rgba(255,255,255,0.07)', color: isActive ? '#fff' : 'rgba(240,240,245,0.3)' }}>
                        {tone.label}
                      </span>
                    );
                  })}
                  {!dbBrandKit.tone && <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)' }}>— Nie ustawiono</p>}
                </div>
              </div>

              {/* Styl graficzny */}
              <div style={s.card}>
                <span style={s.label}>Styl graficzny marki</span>
                {dbBrandKit.style
                  ? <p style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f5', marginTop: 4 }}>{BRAND_STYLES.find(bs => bs.id === dbBrandKit.style)?.label || dbBrandKit.style}</p>
                  : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

              {/* Kolory marki */}
              <div style={s.card}>
                <span style={s.label}>Kolory marki</span>
                {Array.isArray(dbBrandKit.colors) && dbBrandKit.colors!.some(c => !!c) ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                    {dbBrandKit.colors!.filter(c => !!c).map((col, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: col, border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.55)', fontFamily: 'monospace' }}>{col}</span>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

              {/* Logo */}
              <div style={s.card}>
                <span style={s.label}>Logo</span>
                {dbBrandKit.logo_url ? (
                  <div style={{ width: 80, height: 80, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
                    <img src={dbBrandKit.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                  </div>
                ) : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

              {/* USP */}
              <div style={s.card}>
                <span style={s.label}>Wyróżnik firmy (USP)</span>
                {dbBrandKit.usp
                  ? <p style={{ fontSize: 15, color: '#f0f0f5', lineHeight: 1.5, marginTop: 4 }}>{dbBrandKit.usp}</p>
                  : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

              {/* Pain Point */}
              <div style={s.card}>
                <span style={s.label}>Główny problem klientów</span>
                {dbBrandKit.pain_point
                  ? <p style={{ fontSize: 15, color: '#f0f0f5', lineHeight: 1.5, marginTop: 4 }}>{dbBrandKit.pain_point}</p>
                  : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

              {/* Dream Outcome */}
              <div style={s.card}>
                <span style={s.label}>Wymarzony rezultat klienta</span>
                {dbBrandKit.dream_outcome
                  ? <p style={{ fontSize: 15, color: '#f0f0f5', lineHeight: 1.5, marginTop: 4 }}>{dbBrandKit.dream_outcome}</p>
                  : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

              {/* Grand Slam — tylko jeśli cokolwiek wypełnione */}
              {(dbBrandKit.biggest_pain || dbBrandKit.unique_mechanism) && (
                <div style={{ ...s.card, border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.04)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Psychologia klienta</p>
                  {dbBrandKit.biggest_pain && (
                    <div style={{ marginBottom: 12 }}>
                      <span style={s.label}>Największy ból / strach klienta</span>
                      <p style={{ fontSize: 14, color: '#f0f0f5', lineHeight: 1.5, marginTop: 4 }}>{dbBrandKit.biggest_pain}</p>
                    </div>
                  )}
                  {dbBrandKit.unique_mechanism && (
                    <div>
                      <span style={s.label}>Unikalny mechanizm</span>
                      <p style={{ fontSize: 14, color: '#f0f0f5', lineHeight: 1.5, marginTop: 4 }}>{dbBrandKit.unique_mechanism}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Przykładowe posty */}
              <div style={s.card}>
                <span style={s.label}>Przykładowe posty</span>
                {dbBrandKit.sample_posts
                  ? <p style={{ fontSize: 14, color: '#4ade80', fontWeight: 600, marginTop: 4 }}>
                      {'✅ ' + dbBrandKit.sample_posts!.split('\n\n').filter((p: string) => p.trim()).length + ' postów wklejonych — Claude pisze w Twoim stylu'}
                    </p>
                  : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

              {/* Platformy */}
              <div style={s.card}>
                <span style={s.label}>Aktywne platformy</span>
                {Array.isArray(dbBrandKit.platforms) && dbBrandKit.platforms!.length > 0 ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {dbBrandKit.platforms!.map((pl: string) => (
                      <span key={pl} style={{ padding: '7px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff' }}>
                        {({'facebook': 'Facebook', 'instagram': 'Instagram', 'tiktok': 'TikTok'} as Record<string,string>)[pl] || pl}
                      </span>
                    ))}
                  </div>
                ) : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

              {/* Długość postów */}
              <div style={s.card}>
                <span style={s.label}>Domyślna długość postów</span>
                {dbBrandKit.length
                  ? <p style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f5', marginTop: 4 }}>
                      {({'short': 'Krótki (~100 słów)', 'medium': 'Średni (~250 słów)', 'long': 'Długi (~500 słów)'} as Record<string,string>)[dbBrandKit.length ?? ''] || dbBrandKit.length}
                    </p>
                  : <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.25)', marginTop: 4 }}>— Nie ustawiono</p>}
              </div>

            </div>
          )}
          {/* ── END VIEW MODE ── */}

          {/* ── EDIT MODE: formularz ── */}
          {isEditing && <>

          {/* Presety */}
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Zacznij od presetu</p>
            <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', marginBottom: 16 }}>Wybierz szablon jako punkt startowy — możesz go potem edytować.</p>
            <div className="settings-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {STYLE_PRESETS.map(preset => (
                <button key={preset.id}
                  onClick={() => setBrandKit(prev => ({ ...prev, style: preset.style, tone: preset.tone, colors: preset.colors, tone_source: 'manual' as 'manual' | 'imported' }))}
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <label style={{ ...s.label, marginBottom: 0 }}>Nazwa firmy</label>
              <span style={tipIcon} onMouseEnter={() => setTooltip('company_name')} onMouseLeave={() => setTooltip(null)}>?</span>
              {tooltip === 'company_name' && <span style={tipStyle}>Pełna nazwa Twojej firmy lub marka, tak jak używasz jej na co dzień.</span>}
            </div>
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

          {/* USP / Wyróżnik */}
          <div style={s.card}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <label style={{ ...s.label, marginBottom: 0 }}>Wyróżnik firmy (USP) <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', fontSize: 11 }}>(opcjonalnie)</span></label>
              <span style={tipIcon} onMouseEnter={() => setTooltip('usp')} onMouseLeave={() => setTooltip(null)}>?</span>
              {tooltip === 'usp' && <span style={tipStyle}>Co wyróżnia Cię na tle konkurencji? Np. „30-minutowe realizacje”, „jedyna organiczna kawiarnia w okolicy” — AI wplecie to w każdy post.</span>}
            </div>
            <input
              type="text"
              value={brandKit.usp}
              onChange={e => setBrandKit(prev => ({ ...prev, usp: e.target.value, usp_source: 'manual' }))}
              placeholder="np. 30-minutowe metamorfozy bez umawiania, Dostawa w 2h w całym mieście..."
              spellCheck={false}
              style={s.input}
            />
            {brandKit.usp_source === 'imported' && (
              <p style={{ fontSize: 11, color: '#a5b4fc', margin: '8px 0 0', lineHeight: 1.5 }}>✨ Wykryty automatycznie z Twojej strony — zmień jeśli nie pasuje.</p>
            )}
            {brandKit.usp_source !== 'imported' && (
              <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.25)', marginTop: 8 }}>Co Cię wyróżnia na tle konkurencji? AI wplecie to w każdy post.</p>
            )}
          </div>

          {/* Ból klientów */}
          <div style={s.card}>
            <label style={s.label}>Główny problem klientów <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', fontSize: 11 }}>(opcjonalnie)</span></label>
            <input
              type="text"
              value={brandKit.pain_point}
              onChange={e => setBrandKit(prev => ({ ...prev, pain_point: e.target.value, pain_point_source: 'manual' }))}
              placeholder="np. Klientki boją się eksperymentować z kolorem, Faceci nie lubią czekać..."
              spellCheck={false}
              style={s.input}
            />
            {brandKit.pain_point_source === 'imported' && (
              <p style={{ fontSize: 11, color: '#a5b4fc', margin: '8px 0 0', lineHeight: 1.5 }}>✨ Wykryty automatycznie z Twojej strony — zmień jeśli nie pasuje.</p>
            )}
            {brandKit.pain_point_source !== 'imported' && (
              <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.25)', marginTop: 8 }}>Największy ból Twoich klientów — AI użyje go jako haczyka w postach.</p>
            )}
          </div>

          {/* Wymarzony rezultat */}
          <div style={s.card}>
            <label style={s.label}>Wymarzony rezultat klienta <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', fontSize: 11 }}>(opcjonalnie)</span></label>
            <input
              type="text"
              value={brandKit.dream_outcome}
              onChange={e => setBrandKit(prev => ({ ...prev, dream_outcome: e.target.value, dream_outcome_source: 'manual' }))}
              placeholder="np. Wychodzi z salonu z nowym 'vibe' i pewnością siebie, Dom jak z marzeń gotowy na czas..."
              spellCheck={false}
              style={s.input}
            />
            {brandKit.dream_outcome_source === 'imported' && (
              <p style={{ fontSize: 11, color: '#a5b4fc', margin: '8px 0 0', lineHeight: 1.5 }}>✨ Wykryty automatycznie z Twojej strony — zmień jeśli nie pasuje.</p>
            )}
            {brandKit.dream_outcome_source !== 'imported' && (
              <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.25)', marginTop: 8 }}>Co Twój klient naprawdę chce osiągnąć? To wzmocni przekaz każdego posta.</p>
            )}
          </div>

          {/* Grand Slam — Poznaj klientow glebiej */}
          <div style={{ ...s.card, border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.04)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Poznaj swoich klientów głębiej</p>
            <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', marginBottom: 20, lineHeight: 1.5 }}>Te pola są opcjonalne, ale znacząco podnoszą jakość generowanych treści. Claude będzie pisał posty, które trafiają w serce klienta.</p>

            {/* Najwiekszy Bol klienta */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <label style={{ ...s.label, marginBottom: 0 }}>Największy Ból / Strach klienta</label>
                <span style={tipIcon} onMouseEnter={() => setTooltip('biggest_pain')} onMouseLeave={() => setTooltip(null)}>?</span>
                {tooltip === 'biggest_pain' && <span style={tipStyle}>Czego Twój klient się boi lub co go boli PRZED skorzystaniem z Twojej oferty? Np. "ukrytych kosztów remontu", "że AI napisze coś głupiego i zawstydzi się przed klientami"</span>}
              </div>
              <input type="text" value={brandKit.biggest_pain} onChange={e => setBrandKit(prev => ({ ...prev, biggest_pain: e.target.value }))} placeholder="np. że posty będą brzmieć sztucznie i klienci od razu poznają, że to AI" spellCheck={false} style={s.input} />
            </div>

            {/* Unikalny Mechanizm */}
            <div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <label style={{ ...s.label, marginBottom: 0 }}>Unikalny Mechanizm — jak to robisz?</label>
                <span style={tipIcon} onMouseEnter={() => setTooltip('unique_mechanism')} onMouseLeave={() => setTooltip(null)}>?</span>
                {tooltip === 'unique_mechanism' && <span style={tipStyle}>Co sprawia, że Twoja oferta działa? Konkretna metoda, technologia, proces, który wyróżnia Cię od konkurencji. Np. "własna flota 50 aut z GPS", "3-etapowy system doboru fryzury do kształtu twarzy"</span>}
              </div>
              <input type="text" value={brandKit.unique_mechanism} onChange={e => setBrandKit(prev => ({ ...prev, unique_mechanism: e.target.value }))} placeholder="np. AI analizuje styl Twojej firmy i generuje posty, które brzmią jak Ty, a nie jak robot" spellCheck={false} style={s.input} />
            </div>
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: brandKit.tone_source === 'imported' ? 4 : 12 }}>
              <label style={{ ...s.label, marginBottom: 0 }}>Ton komunikacji</label>
              <span style={tipIcon} onMouseEnter={() => setTooltip('tone')} onMouseLeave={() => setTooltip(null)}>?</span>
              {tooltip === 'tone' && <span style={tipStyle}>Jak chcesz brzmieć dla klientów? Np. „cieły i przyjazny” lub „profesjonalny i ekspercki” — AI dobierze styl języka.</span>}
            </div>
            {brandKit.tone_source === 'imported' && (
              <p style={{ fontSize: 11, color: '#a5b4fc', margin: '0 0 10px', lineHeight: 1.5 }}>
                ✨ Wykryty automatycznie z Twojej strony — zmień jeśli nie pasuje.
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {BRAND_TONES.map(tone => (
                <button
                  key={tone.id}
                  onClick={() => setBrandKit(prev => ({ ...prev, tone: tone.id, tone_source: 'manual' as 'manual' | 'imported' }))}
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


          </>}{/* ── END EDIT MODE ── */}

          {/* Social media — Polacz konta */}
          <div id="social" style={{ ...s.card, border: '1px solid rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.04)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Publikacja automatyczna</p>
            <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', marginBottom: 16, lineHeight: 1.5 }}>
              Połącz swoje konta social media przez Zernio — publikuj i planuj posty bezpośrednio z PostujTo bez kopiowania i wklejania.
            </p>
            {!ayrshareProfileKey ? (
              <button
                onClick={handleConnectZernio}
                disabled={isConnectingZernio || currentPlan === 'free'}
                className="btn-primary"
                style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, opacity: (isConnectingZernio || currentPlan === 'free') ? 0.5 : 1, cursor: (isConnectingZernio || currentPlan === 'free') ? 'not-allowed' : 'pointer' }}
              >
                {isConnectingZernio ? '⏳ Łączenie...' : '🔗 Połącz social media'}
              </button>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: '#4ade80', marginBottom: 12 }}>✅ Profil Zernio aktywny</p>
                <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.5)', marginBottom: 12, lineHeight: 1.5 }}>
                  Twój profil jest gotowy. Wejdź na dashboard Zernio, zaloguj się i połącz konta Facebook, Instagram lub TikTok.
                </p>
                <a
                  href="https://app.zernio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', color: '#22d3ee', textDecoration: 'none' }}
                >
                  Otwórz Zernio Dashboard →
                </a>
              </div>
            )}
            {currentPlan === 'free' && (
              <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.35)', marginTop: 12 }}>Dostępne w planie Starter i Pro.</p>
            )}
          </div>

          {/* Twoj plan */}
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
              {isAnnual && (
                <a href="/audit" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', textDecoration: 'none', marginBottom: 12 }}>
                  🔍 Audyt profilu przez AI →
                </a>
              )}
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

          {/* Zapisz — tylko w trybie EDIT */}
          {isEditing && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleCancel}
                style={{ flex: 1, padding: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, color: 'rgba(240,240,245,0.6)', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s', fontFamily: '"Poppins", sans-serif' }}
              >
                ✕ Anuluj
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 2, padding: 18, background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', border: 'none', borderRadius: 18, color: '#fff', fontWeight: 700, fontSize: 17, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s', fontFamily: '"Poppins", sans-serif' }}
              >
                {saving ? '⏳ Zapisuję...' : saved ? '✅ Zapisano!' : 'Zapisz Brand Kit'}
              </button>
            </div>
          )}

          {/* Jak Claude widzi Twoją markę — tylko w trybie EDIT */}
          {isEditing && brandKit.company_name && (
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

          {/* Live Preview — tylko w trybie EDIT */}
          {isEditing && (previewPost || isPreviewLoading) && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,240,245,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>⚡ Podgląd posta</p>
              {isPreviewLoading ? (
                <div style={{ height: 80, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }} />
              ) : (
                <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.7)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{previewPost}</p>
              )}
              <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.2)', marginTop: 10 }}>Generuje się automatycznie 2s po zmianie</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
