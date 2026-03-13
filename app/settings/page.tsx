'use client';

import { useState, useEffect } from 'react';
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

const PRESET_COLORS = [
  '#E31E24', '#FF6600', '#FFD700', '#00A651', '#003087',
  '#6A0DAD', '#E91E8C', '#000000', '#FFFFFF', '#808080',
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
  const [brandKit, setBrandKit] = useState({
    company_name: '',
    colors: ['', '', '', '', ''] as string[],
    style: 'realistic',
    tone: 'professional',
    slogan: '',
    logo_url: '',
    sample_posts: '',
  });

  useEffect(() => {
    if (!user) return;
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
          });
        }
      });
  }, [user]);

  const addColor = (color: string) => {
    if (brandKit.colors.length >= 5) return;
    if (brandKit.colors.includes(color)) return;
    setBrandKit(prev => ({ ...prev, colors: [...prev.colors, color] }));
  };

  const removeColor = (color: string) => {
    setBrandKit(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
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
    { key: 'company_name' as keyof typeof brandKit, label: 'Nazwa firmy', weight: 25 },
    { key: 'colors' as keyof typeof brandKit, label: 'Kolory marki', weight: 15 },
    { key: 'logo_url' as keyof typeof brandKit, label: 'Logo', weight: 20 },
    { key: 'sample_posts' as keyof typeof brandKit, label: 'Przykładowe posty', weight: 30 },
    { key: 'tone' as keyof typeof brandKit, label: 'Ton komunikacji', weight: 10 },
  ];
  const completeness = bkFields.reduce((sum, f) => {
    const val = brandKit[f.key];
    const filled = Array.isArray(val) ? (val as string[]).some(v => !!v) : !!val;
    return filled ? sum + f.weight : sum;
  }, 0);
  const missing = bkFields.filter(f => {
    const val = brandKit[f.key];
    return Array.isArray(val) ? !(val as string[]).some(v => !!v) : !val;
  }).map(f => f.label);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Ustawienia</h1>
            <p className="text-gray-500 mt-1">Skonfiguruj Brand Kit swojej firmy</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
            ← Wróć
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 space-y-8">

          {/* Kompletność */}
          <div className="p-5 rounded-2xl border-2" style={{ borderColor: completeness >= 80 ? '#bbf7d0' : completeness >= 50 ? '#fde68a' : '#fecaca', background: completeness >= 80 ? '#f0fdf4' : completeness >= 50 ? '#fffbeb' : '#fff1f2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="text-sm font-semibold text-gray-800">Kompletność Brand Kitu</span>
              <span className="text-sm font-bold" style={{ color: completeness >= 80 ? '#16a34a' : completeness >= 50 ? '#d97706' : '#dc2626' }}>{completeness}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(0,0,0,0.07)', borderRadius: 100 }}>
              <div style={{ height: '100%', borderRadius: 100, transition: 'width 0.4s ease', width: completeness + '%', background: completeness >= 80 ? 'linear-gradient(90deg,#4ade80,#22c55e)' : completeness >= 50 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : 'linear-gradient(90deg,#f87171,#ef4444)' }} />
            </div>
            {missing.length > 0 && <p className="text-xs text-gray-400 mt-2">Brakuje: {missing.join(', ')}</p>}
            {completeness === 100 && <p className="text-xs font-semibold mt-2" style={{ color: '#16a34a' }}>✅ Brand Kit w pełni skonfigurowany!</p>}
          </div>

          {/* Presety — punkt startowy */}
          <div className="p-5 rounded-2xl border-2 border-purple-100 bg-purple-50">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-1">Zacznij od presetu</p>
            <p className="text-xs text-gray-500 mb-4">Wybierz szablon jako punkt startowy — możesz go potem edytować.</p>
            <div className="grid grid-cols-2 gap-3">
              {STYLE_PRESETS.map(preset => (
                <button key={preset.id}
                  onClick={() => setBrandKit(prev => ({ ...prev, style: preset.style, tone: preset.tone, colors: preset.colors }))}
                  className="p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-400 text-left transition-all bg-white hover:bg-purple-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{preset.emoji}</span>
                    <span className="font-bold text-gray-900 text-sm">{preset.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{preset.desc}</p>
                  <div className="flex gap-1">
                    {preset.colors.map((col, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: col }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nazwa firmy */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Nazwa firmy
            </label>
            <input
              type="text"
              value={brandKit.company_name}
              onChange={e => setBrandKit(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="np. Prujka Hand Made, Restauracja u Kowalskiego..."
              spellCheck={false}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all font-medium"
            />
          </div>

          {/* Slogan */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Slogan <span className="text-gray-400 font-normal normal-case">(opcjonalnie)</span>
            </label>
            <input
              type="text"
              value={brandKit.slogan}
              onChange={e => setBrandKit(prev => ({ ...prev, slogan: e.target.value }))}
              placeholder="np. Jakość z pasji, Smak tradycji..."
              spellCheck={false}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all font-medium"
            />
          </div>

          {/* Kolory marki */}
<div>
  <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
    Kolory marki <span className="text-gray-400 font-normal normal-case">(max 5 — wklej HEX, RGB lub CMYK)</span>
  </label>
  <div className="space-y-3">
    {[0, 1, 2, 3, 4].map(idx => (
      <div key={idx} className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl border-2 border-gray-200 shrink-0"
          style={{ backgroundColor: brandKit.colors[idx] || '#f9fafb' }}
        />
        <input
          type="text"
          value={brandKit.colors[idx] || ''}
          onChange={e => {
            const newColors = Array(5).fill('').map((_, i) => brandKit.colors[i] || '');
            newColors[idx] = e.target.value;
            setBrandKit(prev => ({ ...prev, colors: newColors }));
        }}
          placeholder={`Kolor ${idx + 1} — np. #E31E24, rgb(227,30,36), cmyk(0,87,84,11)`}
          spellCheck={false}
          className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
        />
      </div>
    ))}
  </div>
  <p className="text-xs text-gray-400 mt-2">Podgląd koloru pojawi się automatycznie po wpisaniu prawidłowej wartości HEX</p>
</div>

          {/* Styl marki */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Styl graficzny marki
            </label>
            <div className="grid grid-cols-2 gap-3">
              {BRAND_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => setBrandKit(prev => ({ ...prev, style: style.id }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    brandKit.style === style.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-bold text-gray-900 text-sm">{style.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Ton komunikacji */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Ton komunikacji
            </label>
            <div className="flex flex-wrap gap-3">
              {BRAND_TONES.map(tone => (
                <button
                  key={tone.id}
                  onClick={() => setBrandKit(prev => ({ ...prev, tone: tone.id }))}
                  className={`px-5 py-3 rounded-full font-semibold text-sm transition-all ${
                    brandKit.tone === tone.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Logo <span className="text-gray-400 font-normal normal-case">(opcjonalnie — PNG, JPG, SVG, max 2MB)</span>
            </label>
            <div className="flex items-center gap-6">
              {brandKit.logo_url && (
                <div className="w-24 h-24 rounded-2xl border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img src={brandKit.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                </div>
              )}
              <div>
                <label className="btn-hover cursor-pointer px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-purple-100 hover:text-purple-700 transition-all inline-block">
                  {uploadingLogo ? '⏳ Przesyłam...' : brandKit.logo_url ? '🔄 Zmień logo' : '📁 Wgraj logo'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
                {brandKit.logo_url && (
                  <button
                    onClick={() => setBrandKit(prev => ({ ...prev, logo_url: '' }))}
                    className="ml-3 text-sm text-red-500 hover:text-red-700"
                  >
                    Usuń logo
                  </button>
                )}
              </div>
            </div>
          </div>
{/* Przykładowe posty */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
                Przykładowe posty <span className="text-gray-400 font-normal normal-case">(opcjonalnie)</span>
              </label>
              <button onClick={() => setShowTip(!showTip)} style={{ fontSize: 11, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                {showTip ? 'Ukryj wskazówki' : '💡 Jak to wypełnić?'}
              </button>
            </div>
            {showTip && (
              <div className="mb-3 p-3 rounded-xl" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                <p className="text-xs text-gray-600 mb-2" style={{ lineHeight: 1.7 }}>
                  Wklej 3–5 postów które sam napisałeś i które Ci się podobają. Claude przeanalizuje Twój styl: długość zdań, użycie emoji, ton, słownictwo.
                </p>
                <p className="text-xs text-gray-400 italic" style={{ lineHeight: 1.7 }}>
                  Przykład (salon fryzjerski):<br />
                  "Witajcie! ✂️ Dziś chcemy pokazać Wam metamorfozę naszej Klientki Ani. Przyszła z długimi włosami — wyszła z pewnością siebie! 💪 Umów się: 📞 123 456 789"
                </p>
              </div>
            )}
            {!showTip && <p className="text-xs text-gray-500 mb-3">Wklej 3–10 swoich najlepszych postów. Claude nauczy się Twojego stylu i będzie pisał podobnie.</p>}
            <textarea
              value={brandKit.sample_posts}
              onChange={e => setBrandKit(prev => ({ ...prev, sample_posts: e.target.value }))}
              placeholder={"Wklej tutaj swoje posty, oddzielone pustą linią:\n\nNp.:\nDziś w naszym sklepie nowa dostawa! 🎉 Sprawdź co przywieźliśmy...\n\nKażdy piątek to u nas dzień promocji. Tym razem -20% na...\n\nZa kulisami: tak wygląda nasz poranek przed otwarciem..."}
              rows={10}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all font-medium text-sm resize-y"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <p className="text-xs text-gray-400">
                {brandKit.sample_posts.length > 0
                  ? `✅ ${brandKit.sample_posts.split('\n\n').filter(p => p.trim()).length} postów — Claude będzie pisał w Twoim stylu`
                  : 'Brak przykładów — Claude użyje domyślnego stylu'}
              </p>
              <span style={{ fontSize: 11, color: brandKit.sample_posts.length > 9000 ? '#dc2626' : 'rgba(0,0,0,0.25)' }}>
                {brandKit.sample_posts.length} / 10 000 znaków
              </span>
            </div>
          </div>
          {/* Zapisz */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all disabled:opacity-50 text-lg"
          >
            {saving ? '⏳ Zapisuję...' : saved ? '✅ Zapisano!' : 'Zapisz Brand Kit'}
          </button>

          {brandKit.company_name && (
            <div className="p-5 rounded-2xl border-2 border-gray-100 bg-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">👁 Jak Claude widzi Twoją markę</p>
              <p className="text-sm text-gray-600 italic" style={{ lineHeight: 1.8 }}>
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