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

export default function SettingsPage() {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [brandKit, setBrandKit] = useState({
    company_name: '',
    colors: ['', '', '', '', ''] as string[],
    style: 'realistic',
    tone: 'professional',
    slogan: '',
    logo_url: '',
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

          {/* Zapisz */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all disabled:opacity-50 text-lg"
          >
            {saving ? '⏳ Zapisuję...' : saved ? '✅ Zapisano!' : 'Zapisz Brand Kit'}
          </button>

        </div>
      </div>
    </div>
  );
}