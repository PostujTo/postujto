'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

// ─── POLSKIE OKAZJE ───────────────────────────────────────────────────────────
const POLISH_OCCASIONS: Record<string, { name: string; emoji: string }> = {
  '01-01': { name: 'Nowy Rok', emoji: '🎆' },
  '01-06': { name: 'Trzech Króli', emoji: '⭐' },
  '02-14': { name: 'Walentynki', emoji: '💝' },
  '03-08': { name: 'Dzień Kobiet', emoji: '🌹' },
  '03-20': { name: 'Pierwszy dzień wiosny', emoji: '🌸' },
  '04-01': { name: 'Prima Aprilis', emoji: '🃏' },
  '04-23': { name: 'Dzień Książki', emoji: '📚' },
  '05-01': { name: 'Święto Pracy', emoji: '🔨' },
  '05-03': { name: 'Święto Konstytucji', emoji: '🇵🇱' },
  '05-15': { name: 'Dzień Rodziny', emoji: '👨‍👩‍👧' },
  '05-26': { name: 'Dzień Matki', emoji: '💐' },
  '06-01': { name: 'Dzień Dziecka', emoji: '🧒' },
  '06-21': { name: 'Pierwszy dzień lata', emoji: '☀️' },
  '06-23': { name: 'Dzień Ojca', emoji: '👨' },
  '08-15': { name: 'Wniebowzięcie NMP', emoji: '⛪' },
  '09-01': { name: 'Dzień Edukacji / Back to school', emoji: '🎒' },
  '09-22': { name: 'Pierwszy dzień jesieni', emoji: '🍂' },
  '10-14': { name: 'Dzień Nauczyciela', emoji: '🍎' },
  '10-31': { name: 'Halloween', emoji: '🎃' },
  '11-01': { name: 'Wszystkich Świętych', emoji: '🕯️' },
  '11-11': { name: 'Święto Niepodległości', emoji: '🇵🇱' },
  '11-28': { name: 'Black Friday', emoji: '🛍️' },
  '12-01': { name: 'Cyber Monday', emoji: '💻' },
  '12-06': { name: 'Mikołajki', emoji: '🎅' },
  '12-21': { name: 'Pierwszy dzień zimy', emoji: '❄️' },
  '12-24': { name: 'Wigilia', emoji: '🎄' },
  '12-26': { name: 'Boże Narodzenie', emoji: '🎁' },
  '12-31': { name: 'Sylwester', emoji: '🥂' },
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface CalendarDay {
  date: Date;
  dateKey: string; // MM-DD
  fullKey: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  occasion: { name: string; emoji: string } | null;
  topic: string;
  platform: 'facebook' | 'instagram' | 'tiktok';
  generated: boolean;
  postText?: string;
  hashtags?: string[];
}

type GenerationStatus = 'idle' | 'planning' | 'generating' | 'done' | 'error';

const PLATFORMS = ['facebook', 'instagram', 'tiktok'] as const;
const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#60a5fa',
  instagram: '#f472b6',
  tiktok: '#e2e8f0',
};

function getDaysInMonth(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: CalendarDay[] = [];

  // Padding before (Mon=0)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push({
      date: d, dateKey: `${mm}-${dd}`,
      fullKey: `${d.getFullYear()}-${mm}-${dd}`,
      dayOfMonth: d.getDate(), isCurrentMonth: false, isToday: false,
      occasion: null, topic: '', platform: 'facebook', generated: false,
    });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateKey = `${mm}-${dd}`;
    const fullKey = `${year}-${mm}-${dd}`;
    const isToday = date.toDateString() === today.toDateString();
    days.push({
      date, dateKey, fullKey, dayOfMonth: d,
      isCurrentMonth: true, isToday,
      occasion: POLISH_OCCASIONS[dateKey] || null,
      topic: '', platform: 'facebook', generated: false,
    });
  }

  // Padding after
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push({
      date: d, dateKey: `${mm}-${dd}`,
      fullKey: `${d.getFullYear()}-${mm}-${dd}`,
      dayOfMonth: i, isCurrentMonth: false, isToday: false,
      occasion: null, topic: '', platform: 'facebook', generated: false,
    });
  }

  return days;
}

const MONTH_NAMES_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const DAY_NAMES_PL = ['Pon','Wto','Śro','Czw','Pią','Sob','Nie'];

export default function CalendarPage() {
  const { user } = useUser();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [days, setDays] = useState<CalendarDay[]>(() => getDaysInMonth(today.getFullYear(), today.getMonth()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [defaultPlatform, setDefaultPlatform] = useState<'facebook' | 'instagram' | 'tiktok'>('facebook');
  const [defaultTone, setDefaultTone] = useState<'professional' | 'casual' | 'humorous' | 'sales'>('professional');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const currentDays = days.filter(d => d.isCurrentMonth);

  const navigateMonth = (dir: 1 | -1) => {
    let newMonth = currentMonth + dir;
    let newYear = currentYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setDays(getDaysInMonth(newYear, newMonth));
    setSelectedDay(null);
    setStatus('idle');
    setProgress(0);
  };

  const generatePlan = async () => {
    if (!user) return;
    setStatus('planning');
    setProgress(0);
    setProgressLabel('Claude planuje tematy na cały miesiąc...');

    const occasions = currentDays
      .filter(d => d.occasion)
      .map(d => `${d.fullKey}: ${d.occasion!.emoji} ${d.occasion!.name}`)
      .join('\n');

    try {
      const res = await fetch('/api/calendar/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: currentYear,
          month: currentMonth + 1,
          monthName: MONTH_NAMES_PL[currentMonth],
          occasions,
          platform: defaultPlatform,
          tone: defaultTone,
          daysCount: currentDays.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const plan: Array<{ date: string; topic: string; platform: string }> = data.plan;

      setDays(prev => prev.map(d => {
        if (!d.isCurrentMonth) return d;
        const entry = plan.find(p => p.date === d.fullKey);
        if (!entry) return d;
        return {
          ...d,
          topic: entry.topic,
          platform: (entry.platform as any) || defaultPlatform,
        };
      }));

      setStatus('idle');
      setProgressLabel('');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setProgressLabel('Błąd generowania planu. Spróbuj ponownie.');
    }
  };

  const generateAllPosts = async () => {
    const toGenerate = currentDays.filter(d => d.topic && !d.generated);
    if (toGenerate.length === 0) return;

    setStatus('generating');
    setProgress(0);

    for (let i = 0; i < toGenerate.length; i++) {
      const day = toGenerate[i];
      setProgressLabel(`Generuję post ${i + 1}/${toGenerate.length}: ${day.topic.slice(0, 40)}...`);
      setProgress(Math.round(((i) / toGenerate.length) * 100));

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: day.topic,
            platform: day.platform,
            tone: defaultTone,
            length: 'medium',
          }),
        });
        const data = await res.json();
        if (res.ok && data.posts?.[0]) {
          const post = data.posts[0];
          setDays(prev => prev.map(d =>
            d.fullKey === day.fullKey
              ? { ...d, generated: true, postText: post.text, hashtags: post.hashtags }
              : d
          ));
        }
      } catch (err) {
        console.error(`Error generating post for ${day.fullKey}:`, err);
      }

      // Krótka pauza żeby nie przeciążyć API
      await new Promise(r => setTimeout(r, 500));
    }

    setProgress(100);
    setProgressLabel('Wszystkie posty wygenerowane! 🎉');
    setStatus('done');
  };

  const exportCSV = () => {
    const generated = currentDays.filter(d => d.generated && d.postText);
    if (generated.length === 0) return;

    const headers = ['Data', 'Platforma', 'Temat', 'Okazja', 'Tekst', 'Hashtagi'];
    const rows = generated.map(d => [
      d.fullKey,
      d.platform,
      d.topic,
      d.occasion ? `${d.occasion.emoji} ${d.occasion.name}` : '',
      `"${(d.postText || '').replace(/"/g, '""')}"`,
      (d.hashtags || []).join(' '),
    ]);

    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PostujTo_${MONTH_NAMES_PL[currentMonth]}_${currentYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPost = (day: CalendarDay) => {
    if (!day.postText) return;
    navigator.clipboard.writeText(`${day.postText}\n\n${(day.hashtags || []).join(' ')}`);
    setCopiedKey(day.fullKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const selectedDayData = days.find(d => d.fullKey === selectedDay);
  const generatedCount = currentDays.filter(d => d.generated).length;
  const topicCount = currentDays.filter(d => d.topic).length;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #f0f0f5; }
        .font-display { font-family: 'Poppins', sans-serif; }
        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; font-weight: 600; transition: all 0.25s ease; }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,240,245,0.7); cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.2s ease; }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); color: #f0f0f5; }
        .option-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(240,240,245,0.55); cursor: pointer; transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; }
        .option-btn:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #f0f0f5; }
        .option-btn.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.6); color: #a5b4fc; }
        .cal-day { transition: all 0.2s ease; cursor: pointer; border-radius: 12px; border: 1px solid transparent; }
        .cal-day:hover { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.2); }
        .cal-day.selected { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.5); }
        .cal-day.today { border-color: rgba(99,102,241,0.4); }
        .cal-day.has-topic { background: rgba(34,197,94,0.06); }
        .cal-day.has-topic.generated { background: rgba(34,197,94,0.12); }
        textarea.input-dark { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: #f0f0f5; font-family: 'DM Sans', sans-serif; outline: none; resize: none; transition: all 0.25s ease; }
        textarea.input-dark:focus { background: rgba(255,255,255,0.06); border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        textarea.input-dark::placeholder { color: rgba(240,240,245,0.2); }
        .progress-bar { height: 6px; background: rgba(255,255,255,0.07); border-radius: 100px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); border-radius: 100px; transition: width 0.4s ease; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease-out forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', right: '8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="font-display" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f0f0f5' }}>
                Postuj<span className="gradient-text">To</span>
              </span>
            </Link>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
              <Link href="/app" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '7px 18px', borderRadius: 9, fontSize: 13, border: 'none', background: 'transparent', color: 'rgba(240,240,245,0.5)' }}>
                  ✨ Generator
                </button>
              </Link>
              <button style={{ padding: '7px 18px', borderRadius: 9, fontSize: 13, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', cursor: 'default', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                📅 Kalendarz
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href="/dashboard"><button className="btn-ghost" style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13 }}>Panel</button></Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        <main style={{ flex: 1, maxWidth: 1400, margin: '0 auto', width: '100%', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Controls */}
            <div className="fade-up glass-card" style={{ padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {/* Month nav */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => navigateMonth(-1)} className="btn-ghost" style={{ width: 36, height: 36, borderRadius: 9, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                <span className="font-display" style={{ fontSize: 18, fontWeight: 700, minWidth: 180, textAlign: 'center' }}>
                  {MONTH_NAMES_PL[currentMonth]} {currentYear}
                </span>
                <button onClick={() => navigateMonth(1)} className="btn-ghost" style={{ width: 36, height: 36, borderRadius: 9, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              </div>

              <div style={{ flex: 1 }} />

              {/* Platform */}
              <div style={{ display: 'flex', gap: 6 }}>
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => setDefaultPlatform(p)} className={`option-btn ${defaultPlatform === p ? 'active' : ''}`}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, textTransform: 'capitalize' }}>
                    {p === 'facebook' ? '📘' : p === 'instagram' ? '📸' : '🎵'} {p}
                  </button>
                ))}
              </div>

              {/* Tone */}
              <div style={{ display: 'flex', gap: 6 }}>
                {(['professional', 'casual', 'sales'] as const).map(t => (
                  <button key={t} onClick={() => setDefaultTone(t)} className={`option-btn ${defaultTone === t ? 'active' : ''}`}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12 }}>
                    {t === 'professional' ? '💼' : t === 'casual' ? '😊' : '🛒'} {t === 'professional' ? 'Profesjonalny' : t === 'casual' ? 'Swobodny' : 'Sprzedażowy'}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: 3 }}>
                {(['calendar', 'list'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s', background: view === v ? 'rgba(99,102,241,0.25)' : 'transparent', color: view === v ? '#a5b4fc' : 'rgba(240,240,245,0.45)' }}>
                    {v === 'calendar' ? '📅 Siatka' : '📋 Lista'}
                  </button>
                ))}
              </div>
            </div>

            {/* CALENDAR GRID */}
            {view === 'calendar' && (
              <div className="fade-up glass-card" style={{ padding: 20, animationDelay: '0.05s' }}>
                {/* Day names */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                  {DAY_NAMES_PL.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)', letterSpacing: '0.08em', padding: '6px 0' }}>{d}</div>
                  ))}
                </div>
                {/* Days */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {days.map((day, i) => (
                    <div key={i}
                      onClick={() => day.isCurrentMonth && setSelectedDay(day.fullKey === selectedDay ? null : day.fullKey)}
                      className={`cal-day ${day.isCurrentMonth ? '' : ''} ${day.isToday ? 'today' : ''} ${day.fullKey === selectedDay ? 'selected' : ''} ${day.topic ? 'has-topic' : ''} ${day.generated ? 'generated' : ''}`}
                      style={{ padding: '8px 6px', minHeight: 72, opacity: day.isCurrentMonth ? 1 : 0.25, cursor: day.isCurrentMonth ? 'pointer' : 'default', position: 'relative' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: day.isToday ? 700 : 500, color: day.isToday ? '#a5b4fc' : 'rgba(240,240,245,0.75)' }}>{day.dayOfMonth}</span>
                        {day.occasion && <span style={{ fontSize: 14 }}>{day.occasion.emoji}</span>}
                      </div>
                      {day.topic && (
                        <p style={{ fontSize: 10, color: 'rgba(240,240,245,0.55)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {day.topic}
                        </p>
                      )}
                      {day.generated && (
                        <div style={{ position: 'absolute', bottom: 5, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {[
                    { color: 'rgba(99,102,241,0.4)', label: 'Dzisiaj' },
                    { color: 'rgba(34,197,94,0.15)', label: 'Ma temat' },
                    { color: '#4ade80', label: 'Wygenerowany', dot: true },
                  ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {l.dot
                        ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                        : <div style={{ width: 16, height: 10, borderRadius: 3, background: l.color, border: '1px solid rgba(255,255,255,0.1)' }} />
                      }
                      <span style={{ fontSize: 11, color: 'rgba(240,240,245,0.35)' }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LIST VIEW */}
            {view === 'list' && (
              <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 8, animationDelay: '0.05s' }}>
                {currentDays.map((day, i) => (
                  <div key={day.fullKey}
                    onClick={() => setSelectedDay(day.fullKey === selectedDay ? null : day.fullKey)}
                    className="glass-card"
                    style={{ padding: '14px 20px', cursor: 'pointer', border: day.fullKey === selectedDay ? '1px solid rgba(99,102,241,0.5)' : undefined, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 14 }}
                  >
                    <div style={{ width: 44, textAlign: 'center', flexShrink: 0 }}>
                      <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: day.isToday ? '#a5b4fc' : 'rgba(240,240,245,0.6)', lineHeight: 1 }}>{day.dayOfMonth}</div>
                      <div style={{ fontSize: 10, color: 'rgba(240,240,245,0.3)', marginTop: 2 }}>{['Pon','Wto','Śro','Czw','Pią','Sob','Nie'][(day.date.getDay() + 6) % 7]}</div>
                    </div>

                    {day.occasion && (
                      <div style={{ flexShrink: 0, textAlign: 'center' }}>
                        <div style={{ fontSize: 20 }}>{day.occasion.emoji}</div>
                        <div style={{ fontSize: 9, color: 'rgba(240,240,245,0.3)', maxWidth: 60, lineHeight: 1.3, marginTop: 2 }}>{day.occasion.name}</div>
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {day.topic ? (
                        <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.8)', lineHeight: 1.5, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{day.topic}</p>
                      ) : (
                        <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.2)', fontStyle: 'italic' }}>Brak tematu</p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {day.platform && (
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: PLATFORM_COLORS[day.platform] }}>
                          {day.platform}
                        </span>
                      )}
                      {day.generated
                        ? <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>✓ Gotowy</span>
                        : day.topic
                        ? <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>Temat</span>
                        : null
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Stats */}
            <div className="fade-up glass-card" style={{ padding: '20px 24px', animationDelay: '0.1s' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Miesiąc w liczbach</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { value: currentDays.length, label: 'Dni', color: 'rgba(240,240,245,0.6)' },
                  { value: Object.keys(POLISH_OCCASIONS).filter(k => { const [m] = k.split('-'); return parseInt(m) === currentMonth + 1; }).length, label: 'Okazji', color: '#fbbf24' },
                  { value: topicCount, label: 'Tematów', color: '#60a5fa' },
                  { value: generatedCount, label: 'Postów', color: '#4ade80' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                    <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,240,245,0.35)', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="fade-up glass-card" style={{ padding: '20px 24px', animationDelay: '0.15s' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Akcje</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={generatePlan} disabled={status === 'planning' || status === 'generating'} className="btn-primary"
                  style={{ padding: '12px', borderRadius: 12, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {status === 'planning'
                    ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Planuję tematy...</>
                    : <>🗓️ Zaplanuj tematy na miesiąc</>
                  }
                </button>

                <button onClick={generateAllPosts}
                  disabled={topicCount === 0 || status === 'planning' || status === 'generating'}
                  className="btn-primary"
                  style={{ padding: '12px', borderRadius: 12, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: topicCount === 0 ? 0.4 : 1 }}>
                  {status === 'generating'
                    ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Generuję posty...</>
                    : <>✨ Wygeneruj {topicCount > 0 ? topicCount : 30} postów</>
                  }
                </button>

                <button onClick={exportCSV} disabled={generatedCount === 0} className="btn-ghost"
                  style={{ padding: '11px', borderRadius: 12, fontSize: 14, opacity: generatedCount === 0 ? 0.4 : 1 }}>
                  📥 Eksportuj CSV ({generatedCount})
                </button>
              </div>

              {/* Progress */}
              {(status === 'planning' || status === 'generating' || status === 'done') && (
                <div style={{ marginTop: 16 }}>
                  <div className="progress-bar" style={{ marginBottom: 8 }}>
                    <div className="progress-fill" style={{ width: `${status === 'planning' ? 30 : progress}%` }} />
                  </div>
                  <p style={{ fontSize: 12, color: status === 'done' ? '#4ade80' : 'rgba(240,240,245,0.45)', lineHeight: 1.5 }}>{progressLabel}</p>
                </div>
              )}
              {status === 'error' && (
                <p style={{ marginTop: 12, fontSize: 12, color: '#f87171' }}>{progressLabel}</p>
              )}
            </div>

            {/* Selected day detail */}
            {selectedDayData && selectedDayData.isCurrentMonth && (
              <div className="fade-up glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {selectedDayData.dayOfMonth} {MONTH_NAMES_PL[currentMonth]}
                  </p>
                  {selectedDayData.occasion && (
                    <span style={{ fontSize: 13, color: '#fbbf24' }}>{selectedDayData.occasion.emoji} {selectedDayData.occasion.name}</span>
                  )}
                </div>

                {/* Editable topic */}
                <label style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', display: 'block', marginBottom: 6 }}>Temat posta</label>
                <textarea className="input-dark" rows={3}
                  value={selectedDayData.topic}
                  onChange={e => setDays(prev => prev.map(d => d.fullKey === selectedDayData.fullKey ? { ...d, topic: e.target.value } : d))}
                  placeholder="Wpisz temat lub zaplanuj automatycznie..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}
                />

                {/* Platform for this day */}
                <label style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', display: 'block', marginBottom: 6 }}>Platforma</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => setDays(prev => prev.map(d => d.fullKey === selectedDayData.fullKey ? { ...d, platform: p } : d))}
                      className={`option-btn ${selectedDayData.platform === p ? 'active' : ''}`}
                      style={{ flex: 1, padding: '6px', borderRadius: 8, fontSize: 11 }}>
                      {p === 'facebook' ? '📘' : p === 'instagram' ? '📸' : '🎵'}
                    </button>
                  ))}
                </div>

                {selectedDayData.generated && selectedDayData.postText ? (
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', display: 'block', marginBottom: 8 }}>Wygenerowany post</label>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                      <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.8)', lineHeight: 1.7, marginBottom: 10 }}>{selectedDayData.postText}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(selectedDayData.hashtags || []).map((tag, i) => (
                          <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, color: '#818cf8' }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => copyPost(selectedDayData)} className="btn-ghost"
                      style={{ width: '100%', padding: '9px', borderRadius: 10, fontSize: 13 }}>
                      {copiedKey === selectedDayData.fullKey ? '✅ Skopiowano!' : '📋 Kopiuj post'}
                    </button>
                  </div>
                ) : selectedDayData.topic ? (
                  <button onClick={async () => {
                    setStatus('generating');
                    setProgressLabel(`Generuję post dla ${selectedDayData.dayOfMonth} ${MONTH_NAMES_PL[currentMonth]}...`);
                    try {
                      const res = await fetch('/api/generate', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ topic: selectedDayData.topic, platform: selectedDayData.platform, tone: defaultTone, length: 'medium' }),
                      });
                      const data = await res.json();
                      if (res.ok && data.posts?.[0]) {
                        const post = data.posts[0];
                        setDays(prev => prev.map(d => d.fullKey === selectedDayData.fullKey ? { ...d, generated: true, postText: post.text, hashtags: post.hashtags } : d));
                      }
                    } catch (err) { console.error(err); }
                    setStatus('idle'); setProgressLabel('');
                  }} className="btn-primary" style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 13 }}>
                    ✨ Wygeneruj ten post
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </main>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.2)' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>PostujTo.com</Link> · © 2025
          </p>
        </footer>
      </div>
    </>
  );
}