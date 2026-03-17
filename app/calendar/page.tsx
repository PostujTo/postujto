'use client';

function pluralPL(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few;
  return many;
}

function weekRangeLabel(weekDays: CalendarDay[]): string {
  const monthDays = weekDays.filter(d => d.isCurrentMonth);
  if (monthDays.length === 0) return '';
  const first = monthDays[0];
  const last = monthDays[monthDays.length - 1];
  const firstDay = parseInt(first.fullKey.split('-')[2]);
  const lastDay = parseInt(last.fullKey.split('-')[2]);
  const monthNames = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  const monthIdx = parseInt(first.fullKey.split('-')[1]) - 1;
  const monthStr = monthNames[monthIdx];
  if (firstDay === lastDay) return `${firstDay} ${monthStr}`;
  return `${firstDay}–${lastDay} ${monthStr}`;
}

function buildWeekGroups(currentDays: CalendarDay[]): CalendarDay[][] {
  const rows: CalendarDay[][] = [];
  for (let i = 0; i < currentDays.length; i += 7) {
    rows.push(currentDays.slice(i, i + 7));
  }
  const monthRows = rows
    .map(row => row.filter(d => d.isCurrentMonth))
    .filter(row => row.length > 0);
  const merged: CalendarDay[][] = [];
  for (let i = 0; i < monthRows.length; i++) {
    const row = monthRows[i];
    if (row.length <= 2) {
      if (merged.length === 0) {
        monthRows[i + 1] = [...row, ...monthRows[i + 1]];
      } else {
        merged[merged.length - 1] = [...merged[merged.length - 1], ...row];
      }
    } else {
      merged.push([...row]);
    }
  }
  return merged;
}

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useClerk } from '@clerk/nextjs';

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
  platform: 'facebook' | 'instagram' | 'tiktok'; // primary (= platforms[0])
  platforms: string[]; // selected platforms for this day
  generated: boolean; // true if ≥1 platform generated
  generated_platforms: Record<string, boolean | undefined>; // per-platform status
  postsByPlatform: Record<string, { text: string; hashtags: string[] } | undefined>; // per-platform content
  postText?: string; // alias: postsByPlatform[platforms[0]]?.text (backward compat)
  hashtags?: string[]; // alias: postsByPlatform[platforms[0]]?.hashtags (backward compat)
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
      occasion: null, topic: '', platform: 'facebook', platforms: ['facebook'],
      generated: false, generated_platforms: {}, postsByPlatform: {},
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
      topic: '', platform: 'facebook', platforms: ['facebook'],
      generated: false, generated_platforms: {}, postsByPlatform: {},
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
      occasion: null, topic: '', platform: 'facebook', platforms: ['facebook'],
      generated: false, generated_platforms: {}, postsByPlatform: {},
    });
  }

  return days;
}

const MONTH_NAMES_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const DAY_NAMES_PL = ['Pon','Wto','Śro','Czw','Pią','Sob','Nie'];

const BEST_TIMES: Record<string, { times: string[]; tip: string }> = {
  facebook: {
    times: ['Wt–Czw 9:00–12:00', 'Śr 13:00–15:00', 'Pt 10:00–11:00'],
    tip: 'Najaktywniej w środy przed południem i wieczorami 19–21.',
  },
  instagram: {
    times: ['Pn–Pt 8:00–9:00', 'Wt–Pt 11:00–13:00', 'Pn/Czw 19:00–21:00'],
    tip: 'Najlepiej rano (dojazd do pracy) i wieczorami.',
  },
  tiktok: {
    times: ['Wt–Czw 19:00–21:00', 'Pt 17:00–19:00', 'Sob 10:00–12:00'],
    tip: 'Algorytm daje największe zasięgi między 19 a 21.',
  },
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export default function CalendarPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [credits, setCredits] = useState<{ plan: string; remaining: number; total: number } | null>(() => {
    if (typeof window === 'undefined') return null;
    try { const d = localStorage.getItem('dash_credits'); return d ? JSON.parse(d) : null; } catch { return null; }
  });
  const [hasBrandKit, setHasBrandKit] = useState(false);

useEffect(() => {
  if (!user) return;
  
  fetch('/api/credits')
    .then(r => r.ok ? r.json() : null)
    .then(data => { if (data) { setCredits(data); try { localStorage.setItem('dash_credits', JSON.stringify(data)); } catch {} } })
    .catch(() => {});

  fetch('/api/brand-kit')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data) {
        setHasBrandKit(!!data.company_name);
        const bkPlatforms: string[] = data.platforms?.length > 0 ? data.platforms : ['facebook', 'instagram', 'tiktok'];
        setAvailablePlatforms(bkPlatforms);
        setSelectedPlatforms(bkPlatforms);
        setActivePlatform(bkPlatforms[0]);
        if (data.tone && ['professional', 'casual', 'humorous', 'sales'].includes(data.tone)) {
          setDefaultTone(data.tone as 'professional' | 'casual' | 'humorous' | 'sales');
        }
        if (data.length && ['short', 'medium', 'long'].includes(data.length)) {
          setDefaultLength(data.length as 'short' | 'medium' | 'long');
        }
      }
    })
    .catch(() => {});
}, [user?.id]);
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [days, setDays] = useState<CalendarDay[]>(() => getDaysInMonth(today.getFullYear(), today.getMonth()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook']);
  const [activePlatform, setActivePlatform] = useState<string>('facebook');
  const [showGenerateModeModal, setShowGenerateModeModal] = useState(false);
  const [generateMode, setGenerateMode] = useState<'copy' | 'adapted'>('copy');
  const [defaultTone, setDefaultTone] = useState<'professional' | 'casual' | 'humorous' | 'sales'>('professional');
  const [defaultLength, setDefaultLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedWeek, setCopiedWeek] = useState<number | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [upgradeModal, setUpgradeModal] = useState<{ generated: number; remaining: number } | null>(null);
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [showPlanTermsModal, setShowPlanTermsModal] = useState(false);
  const [planTermsChecked, setPlanTermsChecked] = useState(false);
  const [planCheckoutLoading, setPlanCheckoutLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [showReplanConfirm, setShowReplanConfirm] = useState(false);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>(['facebook', 'instagram', 'tiktok']);

  // ─── UPGRADE CHECKOUT ─────────────────────────────────────────────────────
  const handleUpgradeStarter = async () => {
    setIsUpgradeLoading(true);
    try {
      const termsRes = await fetch('/api/user/terms-status');
      const { terms_accepted_at } = await termsRes.json();
      if (!terms_accepted_at) {
        setPlanTermsChecked(false);
        setShowPlanTermsModal(true);
        setIsUpgradeLoading(false);
        return;
      }
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      setUpgradeError('Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setIsUpgradeLoading(false);
    }
  };

  const handleConfirmPlanTerms = async () => {
    setPlanCheckoutLoading(true);
    try {
      await fetch('/api/user/accept-terms', { method: 'POST' });
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      setUpgradeError('Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setPlanCheckoutLoading(false);
    }
  };

  // ─── PERSISTENCE ──────────────────────────────────────────────────────────
  const applyTopics = useCallback((topics: any[], prevDays: CalendarDay[]) => {
    return prevDays.map(d => {
      const saved = topics.find((t: any) => t.date === d.fullKey);
      if (!saved || !saved.topic) return d;
      const savedPlatforms: string[] = saved.platforms || [saved.platform] || ['facebook'];
      const savedGenPlatforms: Partial<Record<string, boolean>> = saved.generated_platforms || (saved.generated ? { [savedPlatforms[0]]: true } : {});
      const savedPostsByPlatform: Partial<Record<string, { text: string; hashtags: string[] }>> = saved.posts_by_platform || (saved.post_text ? { [savedPlatforms[0]]: { text: saved.post_text, hashtags: saved.hashtags || [] } } : {});
      return {
        ...d,
        topic: saved.topic,
        platform: savedPlatforms[0] as 'facebook' | 'instagram' | 'tiktok',
        platforms: savedPlatforms,
        generated_platforms: savedGenPlatforms,
        postsByPlatform: savedPostsByPlatform,
        generated: Object.values(savedGenPlatforms).some(Boolean),
        postText: savedPostsByPlatform[savedPlatforms[0]]?.text,
        hashtags: savedPostsByPlatform[savedPlatforms[0]]?.hashtags,
      };
    });
  }, []);

  const loadTopics = useCallback(async (year: number, month: number) => {
    if (!user) return;
    // Instant load from localStorage cache
    const cacheKey = `cal_topics_${year}_${month}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const topics = JSON.parse(cached);
        if (topics?.length) setDays(prev => applyTopics(topics, prev));
      }
    } catch {}
    // Then fetch from API
    try {
      const res = await fetch(`/api/calendar/topics?year=${year}&month=${month + 1}`);
      if (!res.ok) return;
      const { topics } = await res.json();
      if (!topics?.length) return;
      try { localStorage.setItem(cacheKey, JSON.stringify(topics)); } catch {}
      setDays(prev => applyTopics(topics, prev));
    } catch {}
  }, [user?.id, applyTopics]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveTopics = useCallback(async (
    items: Array<{
      date: string; topic: string; platform: string;
      platforms?: string[];
      generated?: boolean;
      generated_platforms?: Partial<Record<string, boolean>>;
      post_text?: string; hashtags?: string[];
      posts_by_platform?: Partial<Record<string, { text: string; hashtags: string[] }>>;
    }>
  ) => {
    if (!user || !items.length) return;
    try {
      await fetch('/api/calendar/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics: items }),
      });
    } catch {}
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadTopics(currentYear, currentMonth);
  }, [currentYear, currentMonth, loadTopics]);

  const FacebookIcon = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
  const InstagramIcon = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
  const TikTokIcon = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>;

  const currentDays = useMemo(() => days.filter(d => d.isCurrentMonth), [days]);

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

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length === 1) return; // block last
      const newPlatforms = selectedPlatforms.filter(x => x !== platform);
      setSelectedPlatforms(newPlatforms);
      if (activePlatform === platform) setActivePlatform(newPlatforms[0]);
    } else {
      setSelectedPlatforms(prev => [...prev, platform]);
    }
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
          platform: selectedPlatforms[0],
          platforms: selectedPlatforms,
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
          platform: (selectedPlatforms[0] as 'facebook' | 'instagram' | 'tiktok'),
          platforms: [...selectedPlatforms],
          generated_platforms: {},
          postsByPlatform: {},
          generated: false,
        };
      }));

      setStatus('idle');
      setProgressLabel('');
      // Zapisz plan do Supabase
      const topicsToSave = plan
        .filter((p: any) => p.topic)
        .map((p: any) => ({
          date: p.date,
          topic: p.topic,
          platform: selectedPlatforms[0],
          platforms: selectedPlatforms,
          generated_platforms: {},
          posts_by_platform: {},
        }));
      saveTopics(topicsToSave);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setProgressLabel('Błąd generowania planu. Spróbuj ponownie.');
    }
  };

  const generateAllPosts = async () => {
    // Only generate days where activePlatform hasn't been generated yet
    const toGenerate = currentDays.filter(d => d.topic && !d.generated_platforms?.[activePlatform]);
    if (toGenerate.length === 0) return;
    // Show mode modal if >1 platform and not Free
    if (selectedPlatforms.length > 1 && credits?.plan !== 'free') {
      setShowGenerateModeModal(true);
      return;
    }
    await doGenerateAllPosts('copy');
  };

  const doGenerateAllPosts = async (mode: 'copy' | 'adapted') => {
    const toGenerate = currentDays.filter(d => d.topic && !d.generated_platforms?.[activePlatform]);
    if (toGenerate.length === 0) return;

    setStatus('generating');
    setProgress(0);

    const processDay = async (day: CalendarDay) => {
      const dayPlatforms = day.platforms.length > 0 ? day.platforms : [day.platform];
      const platformsToGenerate = dayPlatforms.filter(pl => !day.generated_platforms?.[pl]);

      if (mode === 'copy' || dayPlatforms.length === 1) {
        const primaryPlatform = platformsToGenerate[0] || dayPlatforms[0];
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: day.topic, platform: primaryPlatform, tone: defaultTone, length: defaultLength, scheduled_date: day.fullKey }),
        });
        const data = await res.json();
        if (res.status === 403) {
          const err403 = new Error('403') as Error & { status: number };
          err403.status = 403;
          throw err403;
        }
        if (res.ok && data.posts?.[0]) {
          const post = data.posts[0];
          const newGenPlatforms: Partial<Record<string, boolean>> = { ...(day.generated_platforms || {}) };
          const newPostsByPlatform: Partial<Record<string, { text: string; hashtags: string[] }>> = { ...(day.postsByPlatform || {}) };
          for (const pl of dayPlatforms) {
            newGenPlatforms[pl] = true;
            newPostsByPlatform[pl] = { text: post.text, hashtags: post.hashtags || [] };
          }
          setDays(prev => prev.map(d =>
            d.fullKey === day.fullKey
              ? { ...d, generated: true, generated_platforms: newGenPlatforms, postsByPlatform: newPostsByPlatform, postText: post.text, hashtags: post.hashtags }
              : d
          ));
          setCredits(prev => prev ? { ...prev, remaining: data.creditsRemaining } : prev);
          saveTopics([{ date: day.fullKey, topic: day.topic, platform: dayPlatforms[0], platforms: dayPlatforms, generated: true, generated_platforms: newGenPlatforms, post_text: post.text, hashtags: post.hashtags, posts_by_platform: newPostsByPlatform }]);
        }
      } else {
        // Adapted mode (Pro): generate separately for each platform
        const newGenPlatforms: Partial<Record<string, boolean>> = { ...(day.generated_platforms || {}) };
        const newPostsByPlatform: Partial<Record<string, { text: string; hashtags: string[] }>> = { ...(day.postsByPlatform || {}) };
        for (const pl of platformsToGenerate) {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: day.topic, platform: pl, tone: defaultTone, length: defaultLength, scheduled_date: day.fullKey }),
          });
          const data = await res.json();
          if (res.status === 403) {
            const err403 = new Error('403') as Error & { status: number };
            err403.status = 403;
            throw err403;
          }
          if (res.ok && data.posts?.[0]) {
            const post = data.posts[0];
            newGenPlatforms[pl] = true;
            newPostsByPlatform[pl] = { text: post.text, hashtags: post.hashtags || [] };
            setCredits(prev => prev ? { ...prev, remaining: data.creditsRemaining } : prev);
          }
        }
        setDays(prev => prev.map(d =>
          d.fullKey === day.fullKey
            ? { ...d, generated: Object.values(newGenPlatforms).some(Boolean), generated_platforms: newGenPlatforms, postsByPlatform: newPostsByPlatform, postText: newPostsByPlatform[dayPlatforms[0]]?.text, hashtags: newPostsByPlatform[dayPlatforms[0]]?.hashtags }
            : d
        ));
        saveTopics([{ date: day.fullKey, topic: day.topic, platform: dayPlatforms[0], platforms: dayPlatforms, generated: Object.values(newGenPlatforms).some(Boolean), generated_platforms: newGenPlatforms, posts_by_platform: newPostsByPlatform }]);
      }
    };

    const BATCH_SIZE = 5;
    const batches = chunkArray(toGenerate, BATCH_SIZE);
    let completedCount = 0;
    let abort403 = false;

    for (const batch of batches) {
      if (abort403) break;

      setProgressLabel(`Generuję posty ${completedCount + 1}–${Math.min(completedCount + batch.length, toGenerate.length)}/${toGenerate.length}...`);
      setProgress(Math.round((completedCount / toGenerate.length) * 100));

      const results = await Promise.allSettled(batch.map(day => processDay(day)));

      for (const result of results) {
        if (result.status === 'fulfilled') {
          completedCount++;
        } else {
          const err = result.reason as { status?: number; message?: string };
          if (err?.status === 403 || err?.message?.includes('403')) {
            abort403 = true;
          } else {
            console.error('Błąd generowania:', err);
          }
        }
      }

      if (abort403) {
        setStatus('error');
        setProgressLabel('Brak kredytów. Przejdź na plan Starter aby generować bez limitu.');
        setUpgradeModal({ generated: completedCount, remaining: toGenerate.length - completedCount });
        break;
      }
    }

    if (!abort403) {
      setProgress(100);
      setProgressLabel('Wszystkie posty wygenerowane! 🎉');
      setStatus('done');
      fetch('/api/credits').then(r => r.ok ? r.json() : null).then(data => { if (data) setCredits(data); }).catch(() => {});
    }
  };

  const exportCSV = () => {
    const generated = currentDays.filter(d => d.generated);
    if (generated.length === 0) return;

    const headers = ['Data', 'Platformy', 'Temat', 'Okazja', 'Tekst', 'Hashtagi'];
    const rows = generated.map(d => {
      const dayPlatforms = d.platforms?.length ? d.platforms : [d.platform];
      const firstGenPlatform = dayPlatforms.find(pl => d.generated_platforms?.[pl]) || dayPlatforms[0];
      const postContent = d.postsByPlatform?.[firstGenPlatform] || { text: d.postText || '', hashtags: d.hashtags || [] };
      return [
        d.fullKey,
        dayPlatforms.join(','),
        d.topic,
        d.occasion ? `${d.occasion.emoji} ${d.occasion.name}` : '',
        `"${postContent.text.replace(/"/g, '""')}"`,
        postContent.hashtags.join(' '),
      ];
    });

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
  const generatedCount = useMemo(
    () => currentDays.filter(d => d.generated_platforms ? !!d.generated_platforms[activePlatform] : d.generated).length,
    [currentDays, activePlatform]
  );
  const topicCount = useMemo(() => currentDays.filter(d => d.topic).length, [currentDays]);
  const daysWithTopic = useMemo(() => currentDays.filter(d => d.topic), [currentDays]);
  const occasionsCount = useMemo(
    () => Object.keys(POLISH_OCCASIONS).filter(k => { const [m] = k.split('-'); return parseInt(m) === currentMonth + 1; }).length,
    [currentMonth]
  );

  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-dm-sans), sans-serif; background: #0a0a0f; color: #f0f0f5; }
        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; cursor: pointer; font-family: var(--font-poppins), sans-serif; font-weight: 600; transition: all 0.25s ease; }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,240,245,0.7); cursor: pointer; font-family: var(--font-dm-sans), sans-serif; font-weight: 500; transition: all 0.2s ease; }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); color: #f0f0f5; }
        .option-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(240,240,245,0.55); cursor: pointer; transition: all 0.2s ease; font-family: var(--font-dm-sans), sans-serif; }
        .option-btn:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #f0f0f5; }
        .option-btn.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.6); color: #a5b4fc; }
        .cal-day { transition: all 0.2s ease; cursor: pointer; border-radius: 12px; border: 1px solid transparent; }
        .cal-day:hover { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.2); }
        .cal-day.selected { background: rgba(99,102,241,0.15); border: 2px solid rgba(99,102,241,0.8); }
        .cal-day.today { border-color: rgba(99,102,241,0.4); }
        .cal-day.has-topic { background: rgba(34,197,94,0.06); }
        .cal-day.has-topic.generated { background: rgba(34,197,94,0.12); }
        textarea.input-dark { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: #f0f0f5; font-family: var(--font-dm-sans), sans-serif; outline: none; resize: none; transition: all 0.25s ease; }
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
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 68, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
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
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '7px 18px', borderRadius: 9, fontSize: 13, border: 'none', background: 'transparent', color: 'rgba(240,240,245,0.5)' }}>
                  📊 Dashboard
                </button>
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
              {credits && (
                <>
                  <span style={{ padding: '6px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,245,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {credits.plan === 'free' ? 'FREE' : credits.plan === 'standard' ? 'STARTER' : 'PRO'}
                  </span>
                  {credits.plan === 'free' && (
                    <span style={{ padding: '6px 10px', borderRadius: 100, fontSize: 11, background: credits.remaining === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', color: credits.remaining === 0 ? '#f87171' : 'rgba(240,240,245,0.5)' }}>
                      {credits.remaining}/{credits.total} kredytów
                    </span>
                  )}
                </>
              )}
<div style={{ position: 'relative' }}>
                {user?.imageUrl
                  ? <img src={user.imageUrl} alt="Avatar" onClick={() => setAvatarMenuOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', border: '2px solid rgba(99,102,241,0.4)' }} />
                  : <div onClick={() => setAvatarMenuOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', border: '2px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                }
                {avatarMenuOpen && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#16162a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 8, minWidth: 180, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    <Link href="/settings" style={{ textDecoration: 'none' }} onClick={() => setAvatarMenuOpen(false)}>
                      <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 14, color: 'rgba(240,240,245,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        🎨 Brand Kit
                      </div>
                    </Link>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                    <button onClick={() => signOut({ redirectUrl: '/' })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, color: 'rgba(240,240,245,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      ↪ Wyloguj
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* alignItems: 'start' is critical here — prevents column height synchronization
             when the right column changes size (day panel open/close). Do not remove. */}
        <main style={{ flex: 1, maxWidth: 1400, margin: '0 auto', width: '100%', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Controls */}
            <div className="fade-up glass-card" style={{ padding: '20px 24px', marginBottom: 20 }}>
              {/* Górny rząd: miesiąc + platformy + siatka/lista */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                {/* Month nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => navigateMonth(-1)} className="btn-ghost" style={{ width: 36, height: 36, borderRadius: 9, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, paddingBottom: 2 }}>‹</button>
                  <span className="font-display" style={{ fontSize: 18, fontWeight: 700, minWidth: 180, textAlign: 'center' }}>
                    {MONTH_NAMES_PL[currentMonth]} {currentYear}
                  </span>
                  <button onClick={() => navigateMonth(1)} className="btn-ghost" style={{ width: 36, height: 36, borderRadius: 9, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, paddingBottom: 2 }}>›</button>
                </div>

                <div style={{ flex: 1 }} />

                {/* Platform multi-select */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {availablePlatforms.map(pl => {
                    const isSelected = selectedPlatforms.includes(pl);
                    const isLast = isSelected && selectedPlatforms.length === 1;
                    return (
                      <button key={pl} onClick={() => !isLast && togglePlatform(pl)}
                        className={`option-btn ${isSelected ? 'active' : ''}`}
                        style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, opacity: isLast ? 0.7 : 1 }}
                        title={isLast ? 'Minimum 1 platforma wymagana' : ''}>
                        {pl === 'facebook' ? <FacebookIcon /> : pl === 'instagram' ? <InstagramIcon /> : <TikTokIcon />}
                        {pl === 'facebook' ? 'Facebook' : pl === 'instagram' ? 'Instagram' : 'TikTok'}
                        {isSelected && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a5b4fc', flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dolny rząd: tony + długość */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {(['professional', 'casual', 'humorous', 'sales'] as const).map(t => (
                  <button key={t} onClick={() => setDefaultTone(t)} className={`option-btn ${defaultTone === t ? 'active' : ''}`}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12 }}>
                    {t === 'professional' ? '💼' : t === 'casual' ? '😊' : t === 'humorous' ? '😄' : '🛒'}
                    {' '}{t === 'professional' ? 'Profesjonalny' : t === 'casual' ? 'Swobodny' : t === 'humorous' ? 'Humorystyczny' : 'Sprzedażowy'}
                  </button>
                ))}

                <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />

                {(['short', 'medium', 'long'] as const).map(l => {
                  const lLabels = { short: 'Krótki', medium: 'Średni', long: 'Długi' };
                  return (
                    <button key={l} onClick={() => setDefaultLength(l)} className={`option-btn ${defaultLength === l ? 'active' : ''}`}
                      style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12 }}>
                      {lLabels[l]}
                    </button>
                  );
                })}

                <div style={{ flex: 1 }} />

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
              {hasBrandKit && credits?.plan !== 'free' && (
                <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.35)', marginTop: 6, lineHeight: 1.5 }}>
                  💡 Ton i długość pobrane z{' '}
                  <a href="/settings" style={{ color: 'rgba(165,180,252,0.7)', textDecoration: 'none' }}>Brand Kitu</a>
                  {' '}— możesz zmienić dla tego miesiąca.
                </p>
              )}
            </div>

            {/* PLATFORM TABS — always in DOM, hidden when ≤1 platform (prevents layout shift on Brand Kit load) */}
            {/* display:none in list view — list view has its own identical tabs set below */}
            <div style={{ display: view === 'list' ? 'none' : 'flex', gap: 6, marginBottom: 12, minHeight: 35, visibility: selectedPlatforms.length > 1 ? 'visible' : 'hidden' }}>
              {selectedPlatforms.map(pl => (
                <button key={pl} onClick={() => setActivePlatform(pl)}
                  style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, border: activePlatform === pl ? `2px solid ${PLATFORM_COLORS[pl] || 'rgba(255,255,255,0.3)'}` : '1px solid rgba(255,255,255,0.12)', background: activePlatform === pl ? 'rgba(255,255,255,0.06)' : 'transparent', color: activePlatform === pl ? '#fff' : 'rgba(240,240,245,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif", fontWeight: activePlatform === pl ? 600 : 400, transition: 'all 0.15s ease' }}>
                  {pl === 'facebook' ? <FacebookIcon /> : pl === 'instagram' ? <InstagramIcon /> : <TikTokIcon />}
                  {pl === 'facebook' ? 'Facebook' : pl === 'instagram' ? 'Instagram' : 'TikTok'}
                </button>
              ))}
            </div>

            {/* CALENDAR GRID */}
            {view === 'calendar' && (
              <div className="fade-up glass-card" style={{ padding: 20, animationDelay: '0.05s' }}>
                {/* Day names */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                  {DAY_NAMES_PL.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'rgba(240,240,245,0.75)', letterSpacing: '0.08em', padding: '6px 0' }}>{d}</div>
                  ))}
                </div>
                {/* Days */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {days.map((day, i) => (
                    <div key={i}
                      onClick={() => { if (!day.isCurrentMonth) return; setSelectedDay(day.fullKey === selectedDay ? null : day.fullKey); }}
                      className={`cal-day ${day.isCurrentMonth ? '' : ''} ${day.isToday ? 'today' : ''} ${day.fullKey === selectedDay ? 'selected' : ''} ${day.topic ? 'has-topic' : ''} ${day.generated_platforms ? (day.generated_platforms[activePlatform] ? 'generated' : '') : (day.generated ? 'generated' : '')}`}
                      style={{ padding: '8px 6px', minHeight: 72, opacity: day.isCurrentMonth ? 1 : 0.25, cursor: day.isCurrentMonth ? 'pointer' : 'default', position: 'relative', transition: 'background-color 0.15s ease, border-color 0.15s ease' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: day.isToday ? 700 : 500, color: day.isToday ? '#a5b4fc' : 'rgba(240,240,245,0.75)' }}>{day.dayOfMonth}</span>
                        {day.occasion && <span style={{ fontSize: 12, lineHeight: 1, flexShrink: 0 }}>{day.occasion.emoji}</span>}
                      </div>
                      {day.topic && (
                        <p style={{ fontSize: 10, color: 'rgba(240,240,245,0.55)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {day.topic}
                        </p>
                      )}
                      {/* Status dot — active platform only */}
                      {day.isCurrentMonth && (
                        <div style={{ position: 'absolute', bottom: 5, right: 4 }}>
                          {day.generated_platforms?.[activePlatform] && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PLATFORM_COLORS[activePlatform] || '#4ade80', display: 'block', flexShrink: 0 }} />
                          )}
                          {!day.generated_platforms && day.generated && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'block' }} />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {[
                    { color: 'rgba(99,102,241,0.4)', label: 'Dzisiaj' },
                    { color: 'rgba(34,197,94,0.15)', label: 'Ma temat' },
                    { color: PLATFORM_COLORS[activePlatform] || '#4ade80', label: 'Wygenerowany', dot: true },
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
              <div className="fade-up" style={{ animationDelay: '0.05s' }}>
                {/* Platform tabs for list view — always in DOM, hidden when ≤1 platform (prevents layout shift on Brand Kit load) */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, minHeight: 35, visibility: selectedPlatforms.length > 1 ? 'visible' : 'hidden' }}>
                  {selectedPlatforms.map(pl => (
                    <button key={pl} onClick={() => setActivePlatform(pl)}
                      style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, border: activePlatform === pl ? `2px solid ${PLATFORM_COLORS[pl] || 'rgba(255,255,255,0.3)'}` : '1px solid rgba(255,255,255,0.12)', background: activePlatform === pl ? 'rgba(255,255,255,0.06)' : 'transparent', color: activePlatform === pl ? '#fff' : 'rgba(240,240,245,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif", fontWeight: activePlatform === pl ? 600 : 400, transition: 'all 0.15s ease' }}>
                      {pl === 'facebook' ? <FacebookIcon /> : pl === 'instagram' ? <InstagramIcon /> : <TikTokIcon />}
                      {pl === 'facebook' ? 'Facebook' : pl === 'instagram' ? 'Instagram' : 'TikTok'}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {currentDays
                    .filter(day => {
                      if (selectedPlatforms.length <= 1) return true; // show all when 1 platform
                      const dayPlats = day.platforms?.length > 0 ? day.platforms : [day.platform];
                      return dayPlats.includes(activePlatform);
                    })
                    .map((day) => {
                      const dayPlats = day.platforms?.length > 0 ? day.platforms : [day.platform];
                      const isActiveGenerated = day.generated_platforms ? !!day.generated_platforms[activePlatform] : day.generated;
                      const activePost = day.postsByPlatform?.[activePlatform];
                      return (
                        <div key={day.fullKey}
                          onClick={() => { setSelectedDay(day.fullKey === selectedDay ? null : day.fullKey); }}
                          className="glass-card"
                          style={{ padding: '14px 20px', cursor: 'pointer', border: day.fullKey === selectedDay ? '1px solid rgba(99,102,241,0.5)' : undefined, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 14 }}
                        >
                          <div style={{ width: 44, textAlign: 'center', flexShrink: 0 }}>
                            <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: day.isToday ? '#a5b4fc' : 'rgba(240,240,245,0.6)', lineHeight: 1 }}>{day.dayOfMonth}</div>
                            <div style={{ fontSize: 11, color: 'rgba(240,240,245,0.6)', marginTop: 2 }}>{['Pon','Wto','Śro','Czw','Pią','Sob','Nie'][(day.date.getDay() + 6) % 7]}</div>
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

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            {isActiveGenerated && activePost ? (
                              <>
                                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>✓ Gotowy</span>
                                <button onClick={() => {
                                  navigator.clipboard.writeText(`${activePost.text}\n\n${(activePost.hashtags || []).join(' ')}`);
                                  setCopiedKey(day.fullKey + '_' + activePlatform);
                                  setTimeout(() => setCopiedKey(null), 2000);
                                }} className="btn-ghost" style={{ padding: '4px 10px', borderRadius: 7, fontSize: 12 }}>
                                  {copiedKey === day.fullKey + '_' + activePlatform ? '✅' : '📋 Kopiuj'}
                                </button>
                              </>
                            ) : day.topic ? (
                              <>
                                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>Temat</span>
                                <button onClick={async () => {
                                  setProgressLabel(`Generuję post dla ${day.dayOfMonth} ${MONTH_NAMES_PL[currentMonth]}...`);
                                  try {
                                    const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: day.topic, platform: activePlatform, tone: defaultTone, length: defaultLength, scheduled_date: day.fullKey }) });
                                    const data = await res.json();
                                    if (res.ok && data.posts?.[0]) {
                                      const post = data.posts[0];
                                      const newGenPlatforms = { ...(day.generated_platforms || {}), [activePlatform]: true };
                                      const newPostsByPlatform = { ...(day.postsByPlatform || {}), [activePlatform]: { text: post.text, hashtags: post.hashtags || [] } };
                                      setDays(prev => prev.map(d => d.fullKey === day.fullKey ? { ...d, generated: true, generated_platforms: newGenPlatforms, postsByPlatform: newPostsByPlatform } : d));
                                      saveTopics([{ date: day.fullKey, topic: day.topic, platform: dayPlats[0], platforms: dayPlats, generated: true, generated_platforms: newGenPlatforms, posts_by_platform: newPostsByPlatform }]);
                                      if (data.creditsRemaining !== undefined) setCredits(prev => prev ? { ...prev, remaining: data.creditsRemaining } : prev);
                                    }
                                  } catch (err) { console.error(err); }
                                  setProgressLabel('');
                                }} className="btn-primary" style={{ padding: '4px 10px', borderRadius: 7, fontSize: 12, border: 'none' }}>
                                  ✨ Generuj
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          {/* MIESIĄC W LICZBACH */}
          <div className="fade-up glass-card" style={{ padding: '20px 24px', marginTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>MIESIĄC W LICZBACH</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, willChange: 'contents' }}>
              {(() => {
                return [
                  { value: currentDays.length, label: pluralPL(currentDays.length, 'dzień', 'dni', 'dni'), color: 'rgba(240,240,245,0.6)', platformIcon: false },
                  { value: occasionsCount, label: pluralPL(occasionsCount, 'okazja', 'okazje', 'okazji'), color: '#fbbf24', platformIcon: false },
                  { value: topicCount, label: pluralPL(topicCount, 'temat', 'tematy', 'tematów'), color: '#60a5fa', platformIcon: false },
                  { value: generatedCount, label: pluralPL(generatedCount, 'post', 'posty', 'postów'), color: PLATFORM_COLORS[activePlatform] || '#4ade80', platformIcon: availablePlatforms.length > 1 },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                    <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,240,245,0.35)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      {s.platformIcon && (
                        <span style={{ opacity: 0.6, display: 'flex', alignItems: 'center' }}>
                          {activePlatform === 'facebook' ? <FacebookIcon /> : activePlatform === 'instagram' ? <InstagramIcon /> : <TikTokIcon />}
                        </span>
                      )}
                      {s.label}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ position: 'sticky', top: 88, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Actions */}
            <div className="fade-up glass-card" style={{ padding: '20px 24px', animationDelay: '0.15s' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Akcje</p>

              <p style={{ fontSize: 11, color: hasBrandKit ? 'rgba(52,211,153,0.8)' : 'rgba(251,191,36,0.8)', marginBottom: 8, lineHeight: 1.5 }}>
                {hasBrandKit
                  ? '✅ Claude użyje Twojego Brand Kitu'
                  : <><span style={{ color: 'rgba(251,191,36,0.8)' }}>⚠️ Brak Brand Kitu — tematy będą generyczne. Uzupełnij go w </span><Link href="/settings" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>Brand Kit</Link>.</>}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => { if (generatedCount > 0) { setShowReplanConfirm(true); } else { generatePlan(); } }} disabled={status === 'planning' || status === 'generating'} className="btn-primary"
                  style={{ padding: '12px', borderRadius: 12, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none' }}>
                  {status === 'planning'
                    ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Planuję tematy...</>
                    : <span>🗓️ Zaplanuj tematy na miesiąc</span>
                  }
                </button>

                <button onClick={generateAllPosts}
                  disabled={topicCount === 0 || status === 'planning' || status === 'generating' || (credits?.plan === 'free' && credits.remaining === 0) || currentDays.filter(d => d.topic && !d.generated_platforms?.[activePlatform]).length === 0}
                  className="btn-primary"
                  style={{ padding: '12px', borderRadius: 12, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', minHeight: 52, opacity: (topicCount === 0 || (credits?.plan === 'free' && credits.remaining === 0) || currentDays.filter(d => d.topic && !d.generated_platforms?.[activePlatform]).length === 0) ? 0.4 : 1 }}>
                  {status === 'generating'
                    ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Generuję posty...</>
                    : credits?.plan === 'free' && credits.remaining === 0
                    ? <span>✨ Brak kredytów — przejdź na Starter</span>
                    : (() => {
                        const remaining = currentDays.filter(d => d.topic && !d.generated_platforms?.[activePlatform]).length;
                        const alreadyGenerated = currentDays.filter(d => d.generated_platforms?.[activePlatform]).length;
                        if (remaining === 0 && topicCount > 0) return <span>✓ Wszystkie posty gotowe</span>;
                        if (alreadyGenerated > 0) return <span>⚡ Wygeneruj pozostałe {remaining} postów{credits?.plan === 'free' ? ` (${credits.remaining} kredytów)` : ''}</span>;
                        return <span>⚡ Wygeneruj {remaining} postów{credits?.plan === 'free' ? ` (${credits.remaining} kredytów)` : ''}</span>;
                      })()
                  }
                </button>

                <button onClick={exportCSV} disabled={generatedCount === 0}
                  style={{ padding: '11px', borderRadius: 12, fontSize: 14, cursor: generatedCount === 0 ? 'not-allowed' : 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: generatedCount === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', color: generatedCount === 0 ? 'rgba(240,240,245,0.3)' : 'rgba(240,240,245,0.8)', transition: 'all 0.2s', width: '100%' }}>
                  📥 Eksportuj CSV ({generatedCount})
                </button>

                {/* Kopiuj serie na tydzien */}
                {(() => {
                  const weekGroups = buildWeekGroups(currentDays);
                  const groupsWithPosts = weekGroups.filter(group => group.some(d => d.generated));
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, minHeight: 88, visibility: groupsWithPosts.length > 0 ? 'visible' : 'hidden' }}>
                      {weekGroups.map((group, weekIdx) => {
                        const weekGenerated = group.filter(d => d.generated);
                        if (weekGenerated.length === 0) return null;
                        return (
                          <button key={weekIdx}
                            onClick={() => {
                              const text = weekGenerated.map(d =>
                                `📅 ${d.fullKey} [${d.platform.toUpperCase()}]\n${d.postText}\n${(d.hashtags || []).join(' ')}`
                              ).join('\n\n---\n\n');
                              navigator.clipboard.writeText(text);
                              setCopiedWeek(weekIdx);
                              setTimeout(() => setCopiedWeek(null), 2000);
                            }}
                            className="btn-ghost"
                            style={{ padding: '11px', borderRadius: 12, fontSize: 13 }}
                          >
                            {copiedWeek === weekIdx ? '✅ Skopiowano!' : `📋 Tydz. ${weekIdx + 1} · ${weekRangeLabel(group)}`}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
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
              <div className="fade-up glass-card" style={{ padding: '20px 24px', minHeight: 480 }}>
                {(() => {
                  const idx = daysWithTopic.findIndex(d => d.fullKey === selectedDay);
                  const prevDay = idx > 0 ? daysWithTopic[idx - 1] : null;
                  const nextDay = idx < daysWithTopic.length - 1 ? daysWithTopic[idx + 1] : null;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, minHeight: 44 }}>
                      <button onClick={() => prevDay && setSelectedDay(prevDay.fullKey)} disabled={!prevDay}
                        className="btn-ghost" style={{ width: 36, height: 36, borderRadius: 9, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, paddingBottom: 2, opacity: prevDay ? 1 : 0.3 }}>‹</button>
                      <div style={{ textAlign: 'center', minHeight: 36 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.75)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                          {selectedDayData.dayOfMonth} {MONTH_NAMES_PL[currentMonth]}
                        </p>
                        <span style={{ fontSize: 12, color: '#fbbf24', display: 'block', minHeight: 18, visibility: selectedDayData.occasion ? 'visible' : 'hidden' }}>
                          {selectedDayData.occasion ? `${selectedDayData.occasion.emoji} ${selectedDayData.occasion.name}` : 'placeholder'}
                        </span>
                      </div>
                      <button onClick={() => nextDay && setSelectedDay(nextDay.fullKey)} disabled={!nextDay}
                        className="btn-ghost" style={{ width: 36, height: 36, borderRadius: 9, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, paddingBottom: 2, opacity: nextDay ? 1 : 0.3 }}>›</button>
                    </div>
                  );
                })()}

                {/* Editable topic */}
                <label style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', display: 'block', marginBottom: 6 }}>Temat posta</label>
                <textarea className="input-dark" rows={3}
                  value={selectedDayData.topic}
                  onChange={e => setDays(prev => prev.map(d => d.fullKey === selectedDayData.fullKey ? { ...d, topic: e.target.value } : d))}
                  onBlur={e => { if (e.target.value) saveTopics([{ date: selectedDayData.fullKey, topic: e.target.value, platform: selectedDayData.platform }]); }}
                  placeholder="Wpisz temat lub zaplanuj automatycznie..."
                  spellCheck={false}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}
                />

                {/* Platform for this day — static, follows activePlatform */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)' }}>Platforma:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: PLATFORM_COLORS[activePlatform], display: 'flex', alignItems: 'center', gap: 4 }}>
                    {activePlatform === 'facebook' ? <FacebookIcon /> : activePlatform === 'instagram' ? <InstagramIcon /> : <TikTokIcon />}
                    {activePlatform === 'facebook' ? 'Facebook' : activePlatform === 'instagram' ? 'Instagram' : 'TikTok'}
                  </span>
                </div>

                {/* Best time to post */}
                <div style={{ padding: '10px 12px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>⏰ Najlepsza godzina publikacji</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                    {BEST_TIMES[activePlatform] && BEST_TIMES[activePlatform].times.map((t, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '2px 8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, color: '#a5b4fc', fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.35)', lineHeight: 1.5, margin: 0 }}>{BEST_TIMES[activePlatform]?.tip}</p>
                </div>

                {(() => {
                  const dayPlats = selectedDayData.platforms?.length > 0 ? selectedDayData.platforms : [selectedDayData.platform];
                  const activePost = selectedDayData.postsByPlatform?.[activePlatform];
                  const isActiveGenerated = selectedDayData.generated_platforms ? !!selectedDayData.generated_platforms[activePlatform] : selectedDayData.generated;
                  return isActiveGenerated && activePost ? (
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', display: 'block', marginBottom: 8 }}>
                        Wygenerowany post {dayPlats.length > 1 && <span style={{ color: PLATFORM_COLORS[activePlatform], fontWeight: 600 }}>({activePlatform})</span>}
                      </label>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                        <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.8)', lineHeight: 1.7, marginBottom: 10 }}>{activePost.text}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(activePost.hashtags || []).map((tag, i) => (
                            <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, color: '#818cf8' }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => {
                        navigator.clipboard.writeText(`${activePost.text}\n\n${(activePost.hashtags || []).join(' ')}`);
                        setCopiedKey(selectedDayData.fullKey + '_' + activePlatform);
                        setTimeout(() => setCopiedKey(null), 2000);
                      }} className="btn-ghost" style={{ width: '100%', padding: '9px', borderRadius: 10, fontSize: 13 }}>
                        {copiedKey === selectedDayData.fullKey + '_' + activePlatform ? '✅ Skopiowano!' : '📋 Kopiuj post'}
                      </button>
                      {generateMode === 'copy' && dayPlats.length > 1 && credits?.plan !== 'premium' && (
                        <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.3)', marginTop: 8, lineHeight: 1.5 }}>
                          💡 Ten post to kopia z {dayPlats[0]}. W <Link href="/pricing" style={{ color: '#a5b4fc' }}>planie Pro</Link> dostaniesz wersję dopasowaną do każdej platformy.
                        </p>
                      )}
                    </div>
                  ) : selectedDayData.topic ? (
                    <button onClick={async () => {
                      setStatus('generating');
                      const generatingPlatform = activePlatform;
                      setProgressLabel(`Generuję post dla ${selectedDayData.dayOfMonth} ${MONTH_NAMES_PL[currentMonth]} (${generatingPlatform})...`);
                      try {
                        const res = await fetch('/api/generate', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ topic: selectedDayData.topic, platform: generatingPlatform, tone: defaultTone, length: defaultLength, scheduled_date: selectedDayData.fullKey }),
                        });
                        const data = await res.json();
                        if (res.ok && data.posts?.[0]) {
                          const post = data.posts[0];
                          const newGenPlatforms = { ...(selectedDayData.generated_platforms || {}), [generatingPlatform]: true };
                          const newPostsByPlatform = { ...(selectedDayData.postsByPlatform || {}), [generatingPlatform]: { text: post.text, hashtags: post.hashtags || [] } };
                          setDays(prev => prev.map(d => d.fullKey === selectedDayData.fullKey
                            ? { ...d, generated: true, generated_platforms: newGenPlatforms, postsByPlatform: newPostsByPlatform, postText: post.text, hashtags: post.hashtags }
                            : d));
                          saveTopics([{ date: selectedDayData.fullKey, topic: selectedDayData.topic, platform: dayPlats[0], platforms: dayPlats, generated: true, generated_platforms: newGenPlatforms, post_text: post.text, hashtags: post.hashtags, posts_by_platform: newPostsByPlatform }]);
                          if (data.creditsRemaining !== undefined) setCredits(prev => prev ? { ...prev, remaining: data.creditsRemaining } : prev);
                        }
                      } catch (err) { console.error(err); }
                      setStatus('idle'); setProgressLabel('');
                    }} className="btn-primary" style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 13 }}>
                      ✨ Wygeneruj post
                    </button>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </main>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.2)' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>PostujTo.com</Link> · © 2026
          </p>
        </footer>
      </div>
      {/* GENERATE MODE MODAL */}
      {showGenerateModeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '36px 32px', maxWidth: 480, width: '100%' }}>
            <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f5', marginBottom: 6, lineHeight: 1.3 }}>
              Jak generować posty na kilka platform?
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', marginBottom: 24 }}>
              Wybrałeś {selectedPlatforms.length} platformy: {selectedPlatforms.join(', ')}
            </p>

            {/* Option 1: Copy */}
            <div onClick={() => setGenerateMode('copy')} style={{ border: `2px solid ${generateMode === 'copy' ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, borderRadius: 14, padding: '16px 20px', cursor: 'pointer', marginBottom: 10, background: generateMode === 'copy' ? 'rgba(99,102,241,0.1)' : 'transparent', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${generateMode === 'copy' ? '#6366f1' : 'rgba(255,255,255,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {generateMode === 'copy' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f5', marginBottom: 2 }}>
                    To samo na każdą platformę <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', marginLeft: 6 }}>Starter</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(240,240,245,0.45)' }}>Jeden post, skopiowany na każdą platformę. Szybko i spójnie.</div>
                </div>
              </div>
            </div>

            {/* Option 2: Adapted (Pro only) */}
            <div onClick={() => { if (credits?.plan === 'premium') setGenerateMode('adapted'); }} style={{ border: `2px solid ${generateMode === 'adapted' ? '#a855f7' : 'rgba(255,255,255,0.1)'}`, borderRadius: 14, padding: '16px 20px', cursor: credits?.plan === 'premium' ? 'pointer' : 'not-allowed', marginBottom: 24, background: generateMode === 'adapted' ? 'rgba(168,85,247,0.1)' : 'transparent', opacity: credits?.plan === 'premium' ? 1 : 0.55, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${generateMode === 'adapted' ? '#a855f7' : 'rgba(255,255,255,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {generateMode === 'adapted' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#a855f7' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f5', marginBottom: 2 }}>
                    Dostosowane do każdej platformy <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'rgba(168,85,247,0.2)', color: '#c084fc', marginLeft: 6 }}>Pro ★</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(240,240,245,0.45)' }}>
                    {credits?.plan === 'premium' ? 'Każda platforma dostaje osobno zoptymalizowany content.' : 'Dostępne w planie Pro — każda platforma dostaje osobny content.'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowGenerateModeModal(false)} className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 14 }}>Anuluj</button>
              <button onClick={() => { setShowGenerateModeModal(false); doGenerateAllPosts(generateMode); }} className="btn-primary" style={{ flex: 2, padding: '12px', borderRadius: 12, fontSize: 14, border: 'none' }}>
                <span>✨ Generuj</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN TERMS MODAL */}
      {showPlanTermsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 24, padding: 40, maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f5', marginBottom: 12 }}>Zanim przejdziesz do płatności</h3>
            <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.55)', lineHeight: 1.7, marginBottom: 28 }}>Prosimy o zapoznanie się z dokumentami prawnymi serwisu PostujTo.</p>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '16px 20px', background: planTermsChecked ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${planTermsChecked ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, marginBottom: 24, transition: 'all 0.2s', textAlign: 'left' }}>
              <input type="checkbox" checked={planTermsChecked} onChange={e => setPlanTermsChecked(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: '#6366f1', flexShrink: 0, cursor: 'pointer' }} />
              <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.65)', lineHeight: 1.6 }}>
                Zapoznałem/am się z{' '}
                <a href="/terms" target="_blank" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>Regulaminem</a>
                {' '}i{' '}
                <a href="/privacy" target="_blank" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>Polityką prywatności</a>
                {' '}serwisu PostujTo i akceptuję ich treść. Wyrażam zgodę na natychmiastowe rozpoczęcie świadczenia usługi.
              </span>
            </label>
            <button onClick={handleConfirmPlanTerms} disabled={!planTermsChecked || planCheckoutLoading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, border: 'none', cursor: planTermsChecked ? 'pointer' : 'not-allowed', background: planTermsChecked ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)', color: planTermsChecked ? '#fff' : 'rgba(240,240,245,0.3)', transition: 'all 0.2s', marginBottom: 12 }}>
              {planCheckoutLoading ? 'Ładowanie...' : 'Akceptuję — przejdź do płatności →'}
            </button>
            <button onClick={() => setShowPlanTermsModal(false)}
              style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(240,240,245,0.4)', cursor: 'pointer' }}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* REPLAN CONFIRM MODAL */}
      {showReplanConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }}>
          <div style={{
            background: '#13131a', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 24, padding: 40, maxWidth: 440, width: '100%', textAlign: 'center'
          }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f5', marginBottom: 12 }}>
              Nadpisać istniejące posty?
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.55)', lineHeight: 1.7, marginBottom: 28 }}>
              Masz już <strong style={{ color: '#f87171' }}>{generatedCount} wygenerowanych postów</strong> w tym miesiącu.
              Nowe planowanie usunie wszystkie tematy i posty. Tej operacji nie można cofnąć.
            </p>
            <button
              onClick={() => { setShowReplanConfirm(false); generatePlan(); }}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, fontSize: 15,
                fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 10,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff'
              }}
            >
              Tak, zaplanuj od nowa
            </button>
            <button
              onClick={() => setShowReplanConfirm(false)}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, fontSize: 14,
                fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: 'rgba(240,240,245,0.4)', cursor: 'pointer'
              }}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* UPGRADE MODAL */}
      {upgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '36px 32px', maxWidth: 440, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: '#f0f0f5', marginBottom: 12, lineHeight: 1.3 }}>
              Wygenerowałeś {upgradeModal.generated}/{upgradeModal.generated + upgradeModal.remaining} postów
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.55)', lineHeight: 1.7, marginBottom: 28 }}>
              Zostało Ci <strong style={{ color: '#f87171' }}>{upgradeModal.remaining} dni</strong> bez treści w tym miesiącu.<br />
              Plan Starter odblokuje nielimitowane generowanie za <strong style={{ color: '#a5b4fc' }}>79 zł/msc</strong>.
            </p>
            <button
              onClick={handleUpgradeStarter}
              disabled={isUpgradeLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, border: 'none', marginBottom: 10 }}
            >
              <span>{isUpgradeLoading ? 'Przekierowuję...' : '✨ Przejdź na Starter — 79 zł/msc'}</span>
            </button>
            {upgradeError && (
              <p style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginBottom: 8 }}>
                {upgradeError}
              </p>
            )}
            <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', textAlign: 'center', marginBottom: 10 }}>
              Potrzebujesz więcej?{' '}
              <a
                href="/pricing"
                style={{ color: 'rgba(168,85,247,0.8)', textDecoration: 'none' }}
                onMouseOver={e => (e.currentTarget.style.color = '#a855f7')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(168,85,247,0.8)')}
              >
                Plan Pro — 199 zł/msc →
              </a>
            </p>
            <button onClick={() => { setUpgradeModal(null); setUpgradeError(null); }} className="btn-ghost" style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 14 }}>
              Może później
            </button>
          </div>
        </div>
      )}
    </>
  );
}