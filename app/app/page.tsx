'use client';

const POLISH_CALENDAR = [
  { date: '02-14', name: 'Walentynki', emoji: '💝', days: 0 },
  { date: '03-08', name: 'Dzień Kobiet', emoji: '🌹', days: 0 },
  { date: '03-20', name: 'Pierwszy dzień wiosny', emoji: '🌸', days: 0 },
  { date: '04-20', name: 'Wielkanoc', emoji: '🐣', days: 0 },
  { date: '05-01', name: 'Święto Pracy', emoji: '🔨', days: 0 },
  { date: '05-03', name: 'Święto Konstytucji', emoji: '🇵🇱', days: 0 },
  { date: '05-26', name: 'Dzień Matki', emoji: '💐', days: 0 },
  { date: '06-01', name: 'Dzień Dziecka', emoji: '🧒', days: 0 },
  { date: '06-23', name: 'Dzień Ojca', emoji: '👨', days: 0 },
  { date: '08-15', name: 'Wniebowzięcie NMP', emoji: '⛪', days: 0 },
  { date: '10-31', name: 'Halloween', emoji: '🎃', days: 0 },
  { date: '11-01', name: 'Wszystkich Świętych', emoji: '🕯️', days: 0 },
  { date: '11-11', name: 'Święto Niepodległości', emoji: '🇵🇱', days: 0 },
  { date: '12-06', name: 'Mikołajki', emoji: '🎅', days: 0 },
  { date: '12-24', name: 'Wigilia', emoji: '🎄', days: 0 },
  { date: '12-26', name: 'Boże Narodzenie', emoji: '🎁', days: 0 },
];

function getUpcomingOccasions() {
  const today = new Date();
  const year = today.getFullYear();
  return POLISH_CALENDAR.map(occasion => {
    const [month, day] = occasion.date.split('-').map(Number);
    let occasionDate = new Date(year, month - 1, day);
    if (occasionDate < today) occasionDate = new Date(year + 1, month - 1, day);
    const daysLeft = Math.ceil((occasionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { ...occasion, days: daysLeft };
  }).filter(o => o.days <= 30).sort((a, b) => a.days - b.days).slice(0, 3);
}

const BEST_TIMES: Record<string, { times: string[]; tip: string }> = {
  facebook: {
    times: ['Wt–Czw 9:00–12:00', 'Śr 13:00–15:00', 'Pt 10:00–11:00'],
    tip: 'Polacy najaktywniej scrollują Facebook w środy przed południem i wieczorami 19–21.',
  },
  instagram: {
    times: ['Pn–Pt 8:00–9:00', 'Wt–Pt 11:00–13:00', 'Pn/Czw 19:00–21:00'],
    tip: 'Najlepszy zasięg w tygodniu rano (dojazd do pracy) i wieczorami. Unikaj weekendowych poranków.',
  },
  tiktok: {
    times: ['Wt–Czw 19:00–21:00', 'Pt 17:00–19:00', 'Sob 10:00–12:00'],
    tip: 'TikTok PL żyje wieczorami. Wrzucaj między 19 a 21 — wtedy algorytm daje największe zasięgi.',
  },
};

const INDUSTRIES = [
  { id: 'restaurant', label: 'Restauracja', emoji: '🍽️', hint: 'Użyj apetycznych opisów, podkreśl atmosferę i smak, zachęć do rezerwacji lub wizyty. Wspomnij o polskich smakach i lokalnych składnikach.' },
  { id: 'fashion', label: 'Sklep odzieżowy', emoji: '👗', hint: 'Podkreśl styl, trendy sezonu, zachęć do przymierzenia i wizyty w sklepie. Używaj modnych polskich określeń.' },
  { id: 'beauty', label: 'Salon kosmetyczny', emoji: '💅', hint: 'Podkreśl relaks, profesjonalizm, efekty zabiegu, zachęć do rezerwacji. Nie używaj twierdzeń medycznych.' },
  { id: 'construction', label: 'Budowlanka/remonty', emoji: '🔨', hint: 'Podkreśl doświadczenie, jakość wykonania, terminowość i solidność ekipy. Wspomnij o gwarancji i bezpłatnej wycenie.' },
  { id: 'ecommerce', label: 'Sklep internetowy', emoji: '🛒', hint: 'Podkreśl szybką dostawę, łatwe zwroty, bezpieczne płatności. Zachęć do złożenia zamówienia.' },
  { id: 'fitness', label: 'Siłownia/fitness', emoji: '💪', hint: 'Motywuj do działania, podkreśl efekty i atmosferę, zachęć do zapisania się na trening lub karnet.' },
  { id: 'realestate', label: 'Nieruchomości', emoji: '🏠', hint: 'Podkreśl lokalizację, standard wykończenia i cenę. Zachęć do kontaktu i bezpłatnego oglądania.' },
  { id: 'medical', label: 'Przychodnia/zdrowie', emoji: '🏥', hint: 'Podkreśl profesjonalizm i doświadczenie lekarzy, krótki czas oczekiwania. Nie składaj obietnic medycznych.' },
  { id: 'education', label: 'Edukacja/kursy', emoji: '📚', hint: 'Podkreśl certyfikaty, efekty nauki i opinie uczniów. Zachęć do zapisu na bezpłatną lekcję próbną.' },
  { id: 'automotive', label: 'Motoryzacja', emoji: '🚗', hint: 'Podkreśl parametry techniczne, stan techniczny i cenę. Zachęć do jazdy próbnej lub kontaktu.' },
  { id: 'tourism', label: 'Turystyka/hotel', emoji: '✈️', hint: 'Podkreśl wyjątkowość miejsca, atrakcje i relaks. Zachęć do rezerwacji i podaj dostępne terminy.' },
  { id: 'food', label: 'Sklep spożywczy', emoji: '🛍️', hint: 'Podkreśl świeżość, lokalność produktów i atrakcyjne ceny. Zachęć do odwiedzin lub zamówienia online.' },
];

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

type Plan = 'free' | 'standard' | 'premium';
type ToastType = 'error' | 'success' | 'info' | 'warning';
interface Toast { message: string; type: ToastType; id: number; }

const PLAN_COLORS: Record<Plan, { bg: string; text: string; label: string }> = {
  free: { bg: 'rgba(255,255,255,0.08)', text: '#a0a0b0', label: 'FREE' },
  standard: { bg: 'rgba(6,182,212,0.15)', text: '#22d3ee', label: 'STARTER • Unlimited' },
  premium: { bg: 'rgba(99,102,241,0.2)', text: '#a5b4fc', label: 'PRO • Unlimited' },
};

const TOAST_CONFIG: Record<ToastType, { bg: string; icon: string }> = {
  error: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: '❌' },
  success: { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', icon: '✅' },
  warning: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: '⚠️' },
  info: { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', icon: 'ℹ️' },
};

const FacebookIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const TikTokIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
  </svg>
);

export default function GeneratorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [topic, setTopic] = useState(() => typeof window !== 'undefined' ? sessionStorage.getItem('lastTopic') || '' : '');
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok'>('facebook');
  const [tone, setTone] = useState<'professional' | 'casual' | 'humorous' | 'sales'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{
    text: string; hashtags: string[]; imagePrompt: string;
    generatedImage?: string; imageLoading?: boolean; imageTool?: string;
  }> | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = sessionStorage.getItem('lastResults');
    return saved ? JSON.parse(saved) : null;
  });
  const [generationId, setGenerationId] = useState<string | null>(() => typeof window !== 'undefined' ? sessionStorage.getItem('lastGenerationId') : null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [isGuestResult, setIsGuestResult] = useState(false);
  const [addWatermark, setAddWatermark] = useState(() => typeof window !== 'undefined' ? sessionStorage.getItem('lastAddWatermark') === 'true' : false);
  const [useBrandColors, setUseBrandColors] = useState(() => typeof window !== 'undefined' ? sessionStorage.getItem('lastUseBrandColors') !== 'false' : true);
  const [useBrandVoice, setUseBrandVoice] = useState(() => typeof window !== 'undefined' ? sessionStorage.getItem('lastUseBrandVoice') !== 'false' : true);
  const [credits, setCredits] = useState<{ remaining: number; total: number; plan: Plan } | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const upcomingOccasions = getUpcomingOccasions();

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => { sessionStorage.setItem('lastTopic', topic); }, [topic]);
  useEffect(() => {
    sessionStorage.setItem('lastAddWatermark', String(addWatermark));
    sessionStorage.setItem('lastUseBrandColors', String(useBrandColors));
    sessionStorage.setItem('lastUseBrandVoice', String(useBrandVoice));
  }, [addWatermark, useBrandColors, useBrandVoice]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserCredits();
      // Redirect nowych użytkowników do onboardingu
      fetch('/api/credits').then(r => r.json()).then(data => {
        if (data.onboarding_completed === false) {
          router.push('/onboarding');
        }
      });
    }
    if (isLoaded && !user) {
      setCredits(null); setLoadingCredits(false); setResults(null);
      sessionStorage.removeItem('lastResults'); sessionStorage.removeItem('lastGenerationId');
    }
  }, [isLoaded, user]);

  const fetchUserCredits = async () => {
    if (!user) return;
    setLoadingCredits(true);
    try {
      const res = await fetch('/api/credits');
      if (!res.ok) return;
      const data = await res.json();
      setCredits({ remaining: data.remaining, total: data.total, plan: data.plan || 'free' });
    } catch (err) { console.error(err); }
    finally { setLoadingCredits(false); }
  };

  const handleCheckout = async (priceId: string) => {
    if (!user) { showToast('Zaloguj się aby kupić subskrypcję!', 'warning'); return; }
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Błąd sesji płatności', 'error'); return; }
      if (data.url) window.location.href = data.url;
    } catch { showToast('Wystąpił błąd. Spróbuj ponownie.', 'error'); }
  };

  const handleCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/customer-portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Błąd portalu', 'error'); return; }
      if (data.url) window.location.href = data.url;
    } catch { showToast('Wystąpił błąd. Spróbuj ponownie.', 'error'); }
    finally { setPortalLoading(false); }
  };

  const generateImage = async (idx: number) => {
    if (!results) return;
    if (!credits || credits.plan === 'free') {
      showToast('Generowanie obrazów dostępne w planie Starter i Pro!', 'warning'); return;
    }
    setResults(prev => prev ? prev.map((r, i) => i === idx ? { ...r, imageLoading: true } : r) : null);
    try {
      const res = await fetch('/api/image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, industry: selectedIndustry ? INDUSTRIES.find(i => i.id === selectedIndustry)?.label : null, imagePrompt: results[idx].imagePrompt, addWatermark, useBrandColors }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Błąd generowania obrazu', 'error'); return; }
      setResults(prev => {
        const updated = prev ? prev.map((r, i) => i === idx ? { ...r, generatedImage: data.imageUrl, imageTool: data.tool, imageLoading: false } : r) : null;
        if (updated) sessionStorage.setItem('lastResults', JSON.stringify(updated));
        return updated;
      });
    } catch { showToast('Wystąpił błąd. Spróbuj ponownie.', 'error'); }
    finally { setResults(prev => prev ? prev.map((r, i) => i === idx ? { ...r, imageLoading: false } : r) : null); }
  };

  const generateImageAuto = async (idx: number, imagePrompt: string) => {
    setResults(prev => prev ? prev.map((r, i) => i === idx ? { ...r, imageLoading: true } : r) : null);
    try {
      const res = await fetch('/api/image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, industry: selectedIndustry ? INDUSTRIES.find(i => i.id === selectedIndustry)?.label : null, imagePrompt, addWatermark, useBrandColors }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setResults(prev => {
        const updated = prev ? prev.map((r, i) => i === idx ? { ...r, generatedImage: data.imageUrl, imageTool: data.tool, imageLoading: false } : r) : null;
        if (updated) sessionStorage.setItem('lastResults', JSON.stringify(updated));
        return updated;
      });
    } catch (err) { console.error(err); }
    finally { setResults(prev => prev ? prev.map((r, i) => i === idx ? { ...r, imageLoading: false } : r) : null); }
  };

  const generatePost = async () => {
    if (!topic.trim()) { showToast('Wpisz temat postu!', 'warning'); return; }
    if (user && credits && credits.remaining <= 0) { showToast('Brak kredytów! Przejdź na plan Starter lub Pro.', 'warning'); return; }
    setLoading(true); setResults(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, tone, length, industry: selectedIndustry ? INDUSTRIES.find(i => i.id === selectedIndustry)?.hint : null, use_brand_voice: useBrandVoice }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) { showToast(data.message || 'Brak kredytów!', 'warning'); return; }
        throw new Error(data.error);
      }
      setGenerationId(data.generationId || null);
      setIsGuestResult(data.isGuest || false);
      setLikedPosts(new Set());
      sessionStorage.setItem('lastGenerationId', data.generationId || '');
      const newResults = data.posts.map((post: any) => ({ text: post.text, hashtags: post.hashtags, imagePrompt: post.imagePrompt }));
      setResults(newResults);
      sessionStorage.setItem('lastResults', JSON.stringify(newResults));
      showToast('Posty wygenerowane!', 'success');
      if (credits?.plan === 'premium') newResults.forEach((post: any, idx: number) => generateImageAuto(idx, post.imagePrompt));
      if (data.creditsRemaining !== undefined) setCredits(prev => prev ? { ...prev, remaining: data.creditsRemaining, total: data.creditsTotal || prev.total } : null);
    } catch (error) {
      console.error(error);
      showToast('Błąd podczas generowania. Spróbuj ponownie.', 'error');
    } finally { setLoading(false); }
  };

  const hasActivePlan = credits && credits.plan !== 'free';

  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body { font-family: var(--font-dm-sans), sans-serif; background: #0a0a0f; color: #f0f0f5; min-height: 100vh; }
        font-family: var(--font-poppins), sans-serif;

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(80px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 50px rgba(99,102,241,0.7), 0 0 80px rgba(99,102,241,0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .toast-in { animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin { animation: spin 0.8s linear infinite; }
        .animate-glow { animation: pulse-glow 2.5s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.5s ease-out forwards; }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .text-shimmer {
          background: linear-gradient(90deg, #fff 0%, #a5b4fc 40%, #fff 60%, #c4b5fd 80%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .glass-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          border-radius: 20px;
        }
        .glass-card-hover {
          transition: all 0.3s ease;
        }
        .glass-card-hover:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(99,102,241,0.3);
          transform: translateY(-2px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white; border: none; cursor: pointer;
          font-family: 'Poppins', sans-serif; font-weight: 600;
          transition: all 0.25s ease; position: relative; overflow: hidden;
        }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }

        .btn-ghost {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(240,240,245,0.8); cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          transition: all 0.25s ease;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); }

        .option-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(240,240,245,0.65); cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .option-btn:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #f0f0f5; }
        .option-btn.active {
          background: rgba(99,102,241,0.2);
          border-color: rgba(99,102,241,0.6);
          color: #a5b4fc;
        }

        .textarea-dark {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #f0f0f5;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.25s ease;
          outline: none; resize: none;
        }
        .textarea-dark::placeholder { color: rgba(240,240,245,0.25); }
        .textarea-dark:focus {
          background: rgba(255,255,255,0.06);
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .checkbox-label {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
        }
        .checkbox-label input[type="checkbox"] { accent-color: #6366f1; width: 16px; height: 16px; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
      `}</style>

      {/* Toast container */}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {toasts.map(toast => (
          <div key={toast.id} className="toast-in" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 14, background: TOAST_CONFIG[toast.type].bg, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxWidth: 360, backdropFilter: 'blur(20px)' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{TOAST_CONFIG[toast.type].icon}</span>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'white', flex: 1 }}>{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="font-display" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f0f0f5' }}>
                Postuj<span className="gradient-text">To</span>
              </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-ghost" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 14 }}>
                    Zaloguj się
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                {!loadingCredits && credits && (
                  <>
                    <span style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', background: PLAN_COLORS[credits.plan].bg, color: PLAN_COLORS[credits.plan].text }}>
                      {PLAN_COLORS[credits.plan].label}
                    </span>
                    {credits.plan === 'free' && (
                      <span style={{ padding: '6px 12px', borderRadius: 100, fontSize: 12, background: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,245,0.5)' }}>
                        {credits.remaining}/{credits.total} kredytów
                      </span>
                    )}
                    {hasActivePlan && (
                      <>
                        <Link href="/settings">
                          <button className="btn-ghost" style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13 }}>Ustawienia</button>
                        </Link>
                        <button onClick={handleCustomerPortal} disabled={portalLoading} className="btn-ghost" style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13 }}>
                          {portalLoading ? '...' : 'Subskrypcja'}
                        </button>
                      </>
                    )}
                    <Link href="/calendar">
                      <button className="btn-ghost" style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13 }}>📅 Kalendarz</button>
                    </Link>
                    <Link href="/dashboard">
                      <button className="btn-ghost" style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13 }}>Panel</button>
                    </Link>
                  </>
                )}
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '48px 24px 80px' }}>

          {/* Page title */}
          <div className="fade-up" style={{ marginBottom: 40, textAlign: 'center' }}>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
              Generator <span className="text-shimmer">postów AI</span>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(240,240,245,0.45)' }}>
              Wpisz temat, wybierz platformę i kliknij generuj
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 32, alignItems: 'start' }}>

            {/* LEFT — Form */}
            <div className="fade-up glass-card" style={{ padding: 32, animationDelay: '0.1s' }}>

              {/* Occasions */}
              {upcomingOccasions.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Nadchodzące okazje</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {upcomingOccasions.map(o => (
                      <button key={o.date} onClick={() => setTopic(`Post z okazji ${o.name}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 100, cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)')}
                      >
                        <span style={{ fontSize: 14 }}>{o.emoji}</span>
                        <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 500 }}>{o.name}</span>
                        <span style={{ fontSize: 11, color: 'rgba(165,180,252,0.6)' }}>{o.days === 0 ? 'Dziś' : o.days === 1 ? 'Jutro' : `${o.days}d`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Branża (opcjonalnie)</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {INDUSTRIES.map(industry => (
                    <button key={industry.id} onClick={() => setSelectedIndustry(selectedIndustry === industry.id ? null : industry.id)}
                      className={`option-btn ${selectedIndustry === industry.id ? 'active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, fontSize: 12 }}
                    >
                      <span>{industry.emoji}</span> {industry.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                  O czym ma być post?
                </label>
                <textarea
                  className="textarea-dark"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="np. nowa kolekcja butów sportowych, przepis na ciasto czekoladowe..."
                  rows={3}
                  spellCheck={false}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, lineHeight: 1.6 }}
                />
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={useBrandColors} onChange={e => setUseBrandColors(e.target.checked)} />
                    <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.6)' }}>Użyj kolorów i stylu z Brand Kit</span>
                  </label>
                  <label className="checkbox-label" style={{ opacity: credits?.plan === 'premium' ? 1 : 0.4, cursor: credits?.plan === 'premium' ? 'pointer' : 'not-allowed' }}>
                    <input type="checkbox" checked={addWatermark} onChange={e => setAddWatermark(e.target.checked)} disabled={credits?.plan !== 'premium'} />
                    <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.6)' }}>
                      Dodaj logo na obraz
                      {credits?.plan !== 'premium' && <span style={{ marginLeft: 6, fontSize: 11, color: '#6366f1' }}>(tylko PRO)</span>}
                    </span>
                  </label>
                  <label className="checkbox-label" style={{ opacity: user ? 1 : 0.4, cursor: user ? 'pointer' : 'not-allowed' }}>
                    <input type="checkbox" checked={useBrandVoice} onChange={e => setUseBrandVoice(e.target.checked)} disabled={!user} />
                    <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.6)' }}>
                      Generuj w moim stylu
                      {!user && <span style={{ marginLeft: 6, fontSize: 11, color: '#6366f1' }}>(wymaga logowania)</span>}
                    </span>
                  </label>
                </div>
              </div>

              {/* Platform */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Platforma</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {([
                    { val: 'facebook', label: 'Facebook', Icon: FacebookIcon },
                    { val: 'instagram', label: 'Instagram', Icon: InstagramIcon },
                    { val: 'tiktok', label: 'TikTok', Icon: TikTokIcon },
                  ] as const).map(({ val, label, Icon }) => (
                    <button key={val} onClick={() => setPlatform(val)}
                      className={`option-btn ${platform === val ? 'active' : ''}`}
                      style={{ padding: '10px 8px', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500 }}
                    >
                      <Icon />{label}
                    </button>
                  ))}
                </div>
                {/* Best time to post */}
                <div style={{ marginTop: 10, padding: '12px 14px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', width: '100%', marginBottom: 2 }}>⏰ Najlepsze godziny publikacji (PL)</span>
                    {BEST_TIMES[platform].times.map((t, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '3px 9px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, color: '#a5b4fc', fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', lineHeight: 1.5, margin: 0 }}>{BEST_TIMES[platform].tip}</p>
                </div>
              </div>

              {/* Tone */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Ton</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {([
                    { val: 'professional', label: '💼 Profesjonalny' },
                    { val: 'casual', label: '😊 Swobodny' },
                    { val: 'humorous', label: '😄 Humorystyczny' },
                    { val: 'sales', label: '🛒 Sprzedażowy' },
                  ] as const).map(({ val, label }) => (
                    <button key={val} onClick={() => setTone(val)}
                      className={`option-btn ${tone === val ? 'active' : ''}`}
                      style={{ padding: '9px 12px', borderRadius: 10, fontSize: 13 }}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Długość</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {([
                    { val: 'short', label: 'Krótki', sub: '~100 zn.' },
                    { val: 'medium', label: 'Średni', sub: '~250 zn.' },
                    { val: 'long', label: 'Długi', sub: '~500 zn.' },
                  ] as const).map(({ val, label, sub }) => (
                    <button key={val} onClick={() => setLength(val)}
                      className={`option-btn ${length === val ? 'active' : ''}`}
                      style={{ padding: '10px 8px', borderRadius: 10, fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
                    >
                      <span style={{ fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 10, opacity: 0.6 }}>{sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button onClick={generatePost} disabled={loading} className="btn-primary animate-glow"
                style={{ width: '100%', padding: '16px', borderRadius: 14, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Generuję posty...
                  </>
                ) : (
                  <><span style={{ fontSize: 20 }}>✨</span> Wygeneruj posty</>
                )}
              </button>
            </div>

            {/* RIGHT — Results */}
            <div>
              {!results && (
                <div className="fade-up glass-card" style={{ padding: 48, textAlign: 'center', animationDelay: '0.2s' }}>
                  <div style={{ fontSize: 56, marginBottom: 20 }}>✨</div>
                  <h3 className="font-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: 'rgba(240,240,245,0.8)' }}>Gotowy na pierwszy post?</h3>
                  <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.35)', lineHeight: 1.7 }}>
                    Wypełnij formularz po lewej stronie<br />i kliknij Wygeneruj posty
                  </p>

                  {/* Pricing for non-paid */}
                  {!hasActivePlan && (
                    <div style={{ marginTop: 40, textAlign: 'left' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, textAlign: 'center' }}>Ulepsz plan</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[
                          { name: 'Starter', price: '79 zł', features: ['Unlimited postów', 'Obrazy AI', 'Brand Kit'], priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD },
                          { name: 'Pro', price: '199 zł', features: ['Wszystko ze Starter', 'Auto 3 obrazy', 'Logo na obrazach'], priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM },
                        ].map((plan, i) => (
                          <div key={i} style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 20 }}>
                            <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#a5b4fc', marginBottom: 12 }}>{plan.price}<span style={{ fontSize: 12, opacity: 0.6 }}>/msc</span></div>
                            <ul style={{ listStyle: 'none', marginBottom: 16 }}>
                              {plan.features.map((f, fi) => (
                                <li key={fi} style={{ fontSize: 12, color: 'rgba(240,240,245,0.55)', marginBottom: 5, display: 'flex', gap: 6 }}>
                                  <span style={{ color: '#6366f1' }}>✓</span>{f}
                                </li>
                              ))}
                            </ul>
                            <button onClick={() => handleCheckout(plan.priceId!)} className="btn-primary"
                              style={{ width: '100%', padding: '9px', borderRadius: 10, fontSize: 13 }}>
                              <span>Wybierz</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {results && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Wygenerowane posty</h2>
                    <span style={{ fontSize: 12, padding: '5px 12px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, color: '#4ade80' }}>✓ Gotowe</span>
                  </div>

                  {isGuestResult && (
                    <div style={{ padding: 20, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16 }}>
                      <p className="font-display" style={{ fontWeight: 700, marginBottom: 6 }}>Podoba Ci się? To tylko 1 z 3 wersji!</p>
                      <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.55)', marginBottom: 12 }}>Zaloguj się za darmo i dostań 3 wersje + 5 kredytów na start.</p>
                      <SignInButton mode="modal">
                        <button className="btn-primary" style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13 }}>
                          <span>Załóż konto za darmo →</span>
                        </button>
                      </SignInButton>
                    </div>
                  )}

                  {results.map((result, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: 24 }}>
                      {/* Card header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, color: '#a5b4fc', letterSpacing: '0.05em' }}>
                          WERSJA {idx + 1}
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${result.text}\n\n${result.hashtags.join(' ')}`);
                              setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2000);
                              showToast('Skopiowano do schowka!', 'success');
                            }}
                            className="btn-ghost" style={{ padding: '7px 14px', borderRadius: 9, fontSize: 13 }}
                          >
                            {copiedIdx === idx ? '✅ Skopiowano' : '📋 Kopiuj'}
                          </button>
                          <button
                            onClick={async () => {
                              if (!generationId) return;
                              const isLiked = likedPosts.has(idx);
                              const newLiked = new Set(likedPosts);
                              isLiked ? newLiked.delete(idx) : newLiked.add(idx);
                              setLikedPosts(newLiked);
                              await fetch('/api/dashboard/favorite', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: generationId, is_favorite: newLiked.size > 0, liked_versions: Array.from(newLiked) }),
                              });
                            }}
                            className="btn-ghost" style={{ padding: '7px 14px', borderRadius: 9, fontSize: 13, background: likedPosts.has(idx) ? 'rgba(251,191,36,0.15)' : undefined, borderColor: likedPosts.has(idx) ? 'rgba(251,191,36,0.3)' : undefined, color: likedPosts.has(idx) ? '#fbbf24' : undefined }}
                          >
                            {likedPosts.has(idx) ? '⭐' : '☆'}
                          </button>
                        </div>
                      </div>

                      {/* Text */}
                      <div style={{ marginBottom: 18 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Tekst</p>
                        <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.85)', lineHeight: 1.7 }}>{result.text}</p>
                      </div>

                      {/* Hashtags */}
                      <div style={{ marginBottom: 18 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Hashtagi</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {result.hashtags.map((tag, i) => (
                            <span key={i} style={{ fontSize: 12, padding: '4px 10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#818cf8' }}>{tag}</span>
                          ))}
                        </div>
                      </div>

                      {/* Image */}
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Grafika AI</p>
                        <div style={{ padding: '12px 14px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 12, marginBottom: 12 }}>
                          <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.5)', fontStyle: 'italic' }}>{result.imagePrompt}</p>
                        </div>
                        {result.generatedImage ? (
                          <div>
                            <img src={result.generatedImage} alt="Wygenerowana grafika" style={{ width: '100%', borderRadius: 12, marginBottom: 10 }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: 'rgba(240,240,245,0.25)' }}>Recraft V3</span>
                              <a href={result.generatedImage} download target="_blank"
                                className="btn-ghost" style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, textDecoration: 'none', display: 'inline-block' }}>
                                ⬇ Pobierz
                              </a>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => generateImage(idx)}
                            disabled={result.imageLoading || !credits || credits.plan === 'free'}
                            className={credits && credits.plan !== 'free' ? 'btn-primary' : 'btn-ghost'}
                            style={{ width: '100%', padding: '11px', borderRadius: 12, fontSize: 13, opacity: (!credits || credits.plan === 'free') ? 0.5 : 1 }}
                          >
                            {result.imageLoading ? (
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                                </svg>
                                Generuję...
                              </span>
                            ) : !credits || credits.plan === 'free' ? (
                              <span>🔒 Dostępne w planie Starter i Pro</span>
                            ) : (
                              <span>🖼️ Wygeneruj obraz</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.2)' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>PostujTo.com</Link>
            {' '}· © 2025 · Wykonane z ❤️ w Polsce
          </p>
        </footer>
      </div>
    </>
  );
}