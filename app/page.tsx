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
    if (occasionDate < today) {
      occasionDate = new Date(year + 1, month - 1, day);
    }
    const daysLeft = Math.ceil((occasionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { ...occasion, days: daysLeft };
  })
  .filter(o => o.days <= 30)
  .sort((a, b) => a.days - b.days)
  .slice(0, 3);
}

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
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

type Plan = 'free' | 'standard' | 'premium';
type ToastType = 'error' | 'success' | 'info' | 'warning';

interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

const PLAN_COLORS: Record<Plan, string> = {
  free: 'bg-gray-100 text-gray-600',
  standard: 'bg-cyan-100 text-cyan-700',
  premium: 'bg-purple-100 text-purple-700',
};

const TOAST_STYLES: Record<ToastType, string> = {
  error: 'bg-red-500 text-white',
  success: 'bg-green-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-yellow-500 text-white',
};

const TOAST_ICONS: Record<ToastType, string> = {
  error: '❌',
  success: '✅',
  info: 'ℹ️',
  warning: '⚠️',
};

export default function Home() {
  const { user, isLoaded } = useUser();
  const [topic, setTopic] = useState(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('lastTopic') || '';
  });
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok'>('facebook');
  const [tone, setTone] = useState<'professional' | 'casual' | 'humorous' | 'sales'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{
    text: string;
    hashtags: string[];
    imagePrompt: string;
    generatedImage?: string;
    imageLoading?: boolean;
    imageTool?: string;
  }> | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = sessionStorage.getItem('lastResults');
    return saved ? JSON.parse(saved) : null;
  });
  const [generationId, setGenerationId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('lastGenerationId');
  });
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [isGuestResult, setIsGuestResult] = useState(false);
  const [addWatermark, setAddWatermark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('lastAddWatermark') === 'true';
  });
  const [useBrandColors, setUseBrandColors] = useState(() => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem('lastUseBrandColors') !== 'false';
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  const upcomingOccasions = getUpcomingOccasions();

  // Toast system
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Zapisuj temat do sessionStorage
  useEffect(() => {
    sessionStorage.setItem('lastTopic', topic);
  }, [topic]);

  // Zapisuj checkboxy do sessionStorage
  useEffect(() => {
    sessionStorage.setItem('lastAddWatermark', String(addWatermark));
    sessionStorage.setItem('lastUseBrandColors', String(useBrandColors));
  }, [addWatermark, useBrandColors]);

  const [credits, setCredits] = useState<{
    remaining: number;
    total: number;
    plan: Plan;
  } | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserCredits();
    }
    if (isLoaded && !user) {
      setCredits(null);
      setLoadingCredits(false);
      setResults(null);
      sessionStorage.removeItem('lastResults');
      sessionStorage.removeItem('lastGenerationId');
    }
  }, [isLoaded, user]);

  const fetchUserCredits = async () => {
    if (!user) return;
    setLoadingCredits(true);
    try {
      const response = await fetch('/api/credits');
      if (!response.ok) return;
      const data = await response.json();
      setCredits({
        remaining: data.remaining,
        total: data.total,
        plan: data.plan || 'free',
      });
    } catch (err) {
      console.error('Błąd:', err);
    } finally {
      setLoadingCredits(false);
    }
  };

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      showToast('Zaloguj się aby kupić subskrypcję!', 'warning');
      return;
    }
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Błąd podczas tworzenia sesji płatności', 'error');
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Błąd checkout:', err);
      showToast('Wystąpił błąd. Spróbuj ponownie.', 'error');
    }
  };

  const handleCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Błąd podczas otwierania portalu', 'error');
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Błąd portalu:', err);
      showToast('Wystąpił błąd. Spróbuj ponownie.', 'error');
    } finally {
      setPortalLoading(false);
    }
  };

  const generateImage = async (idx: number) => {
    if (!results) return;
    if (!credits || credits.plan === 'free') {
      showToast('Generowanie obrazów dostępne tylko w planie Starter i Pro!', 'warning');
      return;
    }

    setResults(prev => prev ? prev.map((r, i) =>
      i === idx ? { ...r, imageLoading: true } : r
    ) : null);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          platform,
          industry: selectedIndustry
            ? INDUSTRIES.find(i => i.id === selectedIndustry)?.label
            : null,
          imagePrompt: results[idx].imagePrompt,
          addWatermark,
          useBrandColors,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Błąd generowania obrazu', 'error');
        return;
      }

      setResults(prev => {
        const updated = prev ? prev.map((r, i) =>
          i === idx ? { ...r, generatedImage: data.imageUrl, imageTool: data.tool, imageLoading: false } : r
        ) : null;
        if (updated) sessionStorage.setItem('lastResults', JSON.stringify(updated));
        return updated;
      });

    } catch (err) {
      showToast('Wystąpił błąd. Spróbuj ponownie.', 'error');
    } finally {
      setResults(prev => prev ? prev.map((r, i) =>
        i === idx ? { ...r, imageLoading: false } : r
      ) : null);
    }
  };

  const generateImageAuto = async (idx: number, imagePrompt: string) => {
    setResults(prev => prev ? prev.map((r, i) =>
      i === idx ? { ...r, imageLoading: true } : r
    ) : null);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          platform,
          industry: selectedIndustry
            ? INDUSTRIES.find(i => i.id === selectedIndustry)?.label
            : null,
          imagePrompt,
          addWatermark,
          useBrandColors,
        }),
      });

      const data = await response.json();
      if (!response.ok) return;

      setResults(prev => {
        const updated = prev ? prev.map((r, i) =>
          i === idx ? { ...r, generatedImage: data.imageUrl, imageTool: data.tool, imageLoading: false } : r
        ) : null;
        if (updated) sessionStorage.setItem('lastResults', JSON.stringify(updated));
        return updated;
      });

    } catch (err) {
      console.error('Błąd auto-generowania obrazu:', err);
    } finally {
      setResults(prev => prev ? prev.map((r, i) =>
        i === idx ? { ...r, imageLoading: false } : r
      ) : null);
    }
  };

  const generatePost = async () => {
    if (!topic.trim()) {
      showToast('Wpisz temat postu!', 'warning');
      return;
    }
    if (user && credits && credits.remaining <= 0) {
      showToast('Brak kredytów! Przejdź na plan Starter lub Pro aby kontynuować.', 'warning');
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          platform,
          tone,
          length,
          industry: selectedIndustry
            ? INDUSTRIES.find(i => i.id === selectedIndustry)?.hint
            : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          showToast(data.message || 'Brak kredytów!', 'warning');
          return;
        }
        throw new Error(data.error || 'Błąd podczas generowania postów');
      }
      setGenerationId(data.generationId || null);
      setIsGuestResult(data.isGuest || false);
      setLikedPosts(new Set());
      sessionStorage.setItem('lastGenerationId', data.generationId || '');
      const newResults = data.posts.map((post: any) => ({
        text: post.text,
        hashtags: post.hashtags,
        imagePrompt: post.imagePrompt,
      }));
      setResults(newResults);
      sessionStorage.setItem('lastResults', JSON.stringify(newResults));
      showToast('Posty wygenerowane pomyślnie!', 'success');

      // Auto-generuj obrazy dla planu Pro
      if (credits?.plan === 'premium') {
        newResults.forEach((post: any, idx: number) => {
          generateImageAuto(idx, post.imagePrompt);
        });
      }
      if (data.creditsRemaining !== undefined) {
        setCredits(prev => prev ? {
          ...prev,
          remaining: data.creditsRemaining,
          total: data.creditsTotal || prev.total,
        } : null);
      }
    } catch (error) {
      console.error('Błąd:', error);
      showToast('Wystąpił błąd podczas generowania postów. Spróbuj ponownie.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const hasActivePlan = credits && credits.plan !== 'free';

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');
        * { font-family: 'Lato', sans-serif; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .toast-enter { animation: slideInRight 0.3s ease-out forwards; }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.6); }
        }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .btn-hover { transition: all 0.25s ease; }
        .btn-hover:hover {
          transform: scale(1.08);
          filter: brightness(1.08);
        }
        .btn-hover:active { transform: scale(0.97); }
      `}</style>

      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast-enter flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl pointer-events-auto max-w-sm ${TOAST_STYLES[toast.type]}`}
          >
            <span className="text-xl flex-shrink-0">{TOAST_ICONS[toast.type]}</span>
            <p className="text-sm font-semibold flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white transition-colors flex-shrink-0 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="min-h-screen bg-white">
        {/* Decorative Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">PostujTo.pl</h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">AI Social Media Generator</p>
            </div>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-hover px-6 py-2.5 bg-purple-600 text-white rounded-full font-semibold shadow-lg shadow-purple-500/30">
                  Zaloguj się
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-3">
                {!loadingCredits && credits && (
                  <>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${PLAN_COLORS[credits.plan]}`}>
                      {credits.plan === 'free' ? 'FREE' : credits.plan === 'standard' ? 'STARTER • Unlimited' : 'PRO • Unlimited'}
                    </span>
                    <div className="px-4 py-2 bg-purple-100 rounded-full flex items-center gap-2">
                      {credits.plan === 'free' && (
                        <div className="px-4 py-2 bg-purple-100 rounded-full flex items-center gap-2">
                          <span className="text-sm font-bold text-purple-900">{credits.remaining}/{credits.total}</span>
                          <span className="text-xs text-purple-700">kredytów</span>
                        </div>
                      )}
                    </div>
                    {hasActivePlan && (
                      <div className="flex gap-2">
                        <Link href="/settings" className="btn-hover px-4 py-2 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                          Ustawienia
                        </Link>
                        <button
                          onClick={handleCustomerPortal}
                          disabled={portalLoading}
                          className="btn-hover px-4 py-2 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full disabled:opacity-50"
                        >
                          {portalLoading ? '⏳...' : 'Subskrypcja'}
                        </button>
                      </div>
                    )}
                  </>
                )}
                <Link href="/dashboard" className="btn-hover px-4 py-2 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                  Panel użytkownika
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Hero */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                Używany przez właścicieli firm w Polsce
              </span>
            </div>
            <h2 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Zaoszczędź 10 godzin<br />
              <span className="text-purple-600">tygodniowo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Profesjonalne posty na Facebook, Instagram i TikTok w sekundę.<br />
              <span className="text-cyan-600 font-semibold">Bez stresu, bez pustej kartki, bez przepłacania.</span>
            </p>
          </div>

          {/* Kalendarz okazji */}
          {upcomingOccasions.length > 0 && (
            <div className="max-w-3xl mx-auto mb-6 animate-fade-in-up">
              <div className="flex flex-wrap gap-3">
                {upcomingOccasions.map((occasion) => (
                  <button
                    key={occasion.date}
                    onClick={() => setTopic(`Post z okazji ${occasion.name}`)}
                    className="btn-hover flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 rounded-full shadow-sm hover:border-purple-500 transition-all"
                  >
                    <span className="text-xl">{occasion.emoji}</span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-900">{occasion.name}</div>
                      <div className="text-xs text-purple-600 font-medium">
                        {occasion.days === 0 ? 'Dziś!' : occasion.days === 1 ? 'Jutro!' : `Za ${occasion.days} dni`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Kafelki branż */}
          <div className="max-w-3xl mx-auto mb-6 animate-fade-in-up">
            <p className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Wybierz branżę (opcjonalnie)
            </p>
            <div className="flex flex-wrap gap-3">
              {INDUSTRIES.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(
                    selectedIndustry === industry.id ? null : industry.id
                  )}
                  className={`btn-hover flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                    selectedIndustry === industry.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                  }`}
                >
                  <span>{industry.emoji}</span>
                  {industry.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-10 shadow-2xl border border-gray-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-8">
              {/* Topic */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  O czym ma być post?
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="np. nowa kolekcja butów sportowych, przepis na ciasto czekoladowe..."
                  rows={3}
                  spellCheck={false}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 font-medium resize-none"
                />
                {/* Checkboxy Brand Kit */}
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={useBrandColors}
                      onChange={(e) => setUseBrandColors(e.target.checked)}
                      className="w-4 h-4 accent-purple-600"
                    />
                    <span className="text-sm text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                      Użyj kolorów i stylu marki z Brand Kit
                    </span>
                  </label>
                  <label className={`flex items-center gap-3 ${credits?.plan === 'premium' ? 'cursor-pointer group' : 'cursor-not-allowed opacity-50'}`}>
                    <input
                      type="checkbox"
                      checked={addWatermark}
                      onChange={(e) => setAddWatermark(e.target.checked)}
                      disabled={credits?.plan !== 'premium'}
                      className="w-4 h-4 accent-purple-600"
                    />
                    <span className="text-sm text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                      Dodaj logo marki w prawym dolnym rogu obrazu
                      {credits?.plan !== 'premium' && (
                        <span className="ml-2 text-xs text-purple-500 font-semibold">(tylko plan PRO)</span>
                      )}
                    </span>
                  </label>
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Platforma</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['facebook', 'instagram', 'tiktok'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`btn-hover relative px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 ${
                        platform === p
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {p === 'facebook' ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      ) : p === 'instagram' ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                        </svg>
                      )}
                      {p === 'facebook' ? 'Facebook' : p === 'instagram' ? 'Instagram' : 'TikTok'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Ton wypowiedzi</label>
                <div className="grid grid-cols-4 gap-4">
                  {([
                    { val: 'professional', label: 'Profesjonalny' },
                    { val: 'casual', label: 'Swobodny' },
                    { val: 'humorous', label: 'Humorystyczny' },
                    { val: 'sales', label: 'Sprzedażowy' },
                  ] as const).map(({ val, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTone(val)}
                      className={`btn-hover px-4 py-3 rounded-2xl font-bold ${
                        tone === val
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Długość</label>
                <div className="grid grid-cols-3 gap-4">
                  {([
                    { val: 'short', label: 'Krótki', sub: '~100 znaków' },
                    { val: 'medium', label: 'Średni', sub: '~250 znaków' },
                    { val: 'long', label: 'Długi', sub: '~500 znaków' },
                  ] as const).map(({ val, label, sub }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLength(val)}
                      className={`btn-hover px-5 py-3 rounded-2xl font-bold ${
                        length === val
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold mb-1">{label}</div>
                        <div className="text-xs opacity-80">{sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  onClick={generatePost}
                  disabled={loading}
                  className="btn-hover px-12 py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed pulse-glow"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Generuję posty...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">✨</span>
                      Wygeneruj posty
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="mt-12 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-900">Wygenerowane posty</h3>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">✓ Gotowe!</span>
                {isGuestResult && (
                  <div className="w-full mt-4 p-5 bg-gradient-to-r from-purple-50 to-cyan-50 border-2 border-purple-200 rounded-2xl">
                    <p className="text-gray-900 font-bold text-lg mb-1">
                      Podoba Ci się? To tylko 1 z 3 wersji!
                    </p>
                    <p className="text-gray-600 text-sm mb-3">
                      Zaloguj się za darmo i dostań 3 wersje posta, historię generacji i 5 kredytów na start.
                    </p>
                    <SignInButton mode="modal">
                      <button className="px-6 py-2.5 bg-purple-600 text-white rounded-full font-bold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-colors">
                        Załóż konto za darmo →
                      </button>
                    </SignInButton>
                  </div>
                )}
              </div>
              {results.map((result, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-6 mb-6">
                      <span className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-full shadow-lg shadow-purple-500/30">
                        Wersja {idx + 1}
                      </span>
                      <div className="flex gap-6 ml-auto">
                        <button
                          onClick={() => {
                            const full = `${result.text}\n\n${result.hashtags.join(' ')}`;
                            navigator.clipboard.writeText(full);
                            setCopiedIdx(idx);
                            setTimeout(() => setCopiedIdx(null), 2000);
                            showToast('Post skopiowany do schowka!', 'success');
                          }}
                          className="btn-hover px-5 py-2 bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-md"
                        >
                          {copiedIdx === idx ? '✅ Skopiowano!' : '📋 Kopiuj'}
                        </button>
                        <button
                          onClick={async () => {
                            if (!generationId) return;
                            const isLiked = likedPosts.has(idx);
                            const newLiked = new Set(likedPosts);
                            if (isLiked) {
                              newLiked.delete(idx);
                            } else {
                              newLiked.add(idx);
                            }
                            setLikedPosts(newLiked);
                            await fetch('/api/dashboard/favorite', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                id: generationId,
                                is_favorite: newLiked.size > 0,
                                liked_versions: Array.from(newLiked),
                              }),
                            });
                          }}
                          className={`btn-hover px-5 py-2 rounded-xl text-sm font-semibold shadow-md transition-all ${
                            likedPosts.has(idx)
                              ? 'bg-yellow-400 text-yellow-900'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {likedPosts.has(idx) ? '⭐ Lubię to!' : '☆ Lubię to'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Tekst postu</p>
                      <p className="text-gray-800 text-lg leading-relaxed font-medium">{result.text}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Hashtagi</p>
                      <div className="flex flex-wrap gap-2">
                        {result.hashtags.map((tag, i) => (
                          <span key={i} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Grafika AI</p>
                      <div className="p-4 bg-cyan-50 border-2 border-cyan-200 rounded-xl mb-3">
                        <p className="text-cyan-900 text-sm font-medium italic">{result.imagePrompt}</p>
                      </div>

                      {result.generatedImage ? (
                        <div className="space-y-2">
                          <img
                            src={result.generatedImage}
                            alt="Wygenerowana grafika"
                            className="w-full rounded-xl shadow-lg"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Wygenerowano przez: Recraft V3</span>
                            <a
                              href={result.generatedImage}
                              download
                              target="_blank"
                              className="btn-hover px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold"
                            >
                              Pobierz obraz
                            </a>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => generateImage(idx)}
                          disabled={result.imageLoading || !credits || credits.plan === 'free'}
                          className={`btn-hover w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                            !credits || credits.plan === 'free'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                          }`}
                        >
                          {result.imageLoading ? 'Generuję obraz...' :
                            !credits || credits.plan === 'free' ? 'Dostępne w planie Starter i Pro' :
                            'Wygeneruj obraz'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing - hidden for paid users */}
          {!results && !hasActivePlan && (
            <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-center mb-10">
                <h3 className="text-4xl font-bold text-gray-900 mb-3">
                  Proste <span className="text-purple-600">ceny</span>
                </h3>
                <p className="text-gray-600 text-lg">Wybierz plan dopasowany do Twoich potrzeb</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Free */}
                <div className="card-hover bg-white rounded-2xl p-8 border-2 border-gray-200">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-extrabold text-gray-900">0 zł</div>
                    <div className="text-gray-500 font-semibold mt-2">/ miesiąc</div>
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-purple-600">5</div>
                    <div className="text-sm text-gray-600 font-medium">generacji jednorazowo</div>
                  </div>
                  <button className="btn-hover w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">
                    Twój obecny plan
                  </button>
                </div>

                {/* Standard */}
                <div className="card-hover bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-8 shadow-2xl shadow-cyan-500/40 transform scale-105 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg">
                      NAJPOPULARNIEJSZY
                    </span>
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-5xl font-extrabold text-white">49 zł</div>
                    <div className="text-cyan-100 font-semibold mt-2">/ miesiąc</div>
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-white">Unlimited</div>
                    <div className="text-sm text-cyan-100 font-medium">postów miesięcznie</div>
                  </div>
                  <button
                    onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD!)}
                    className="btn-hover w-full py-3 bg-white text-cyan-600 font-bold rounded-xl shadow-lg"
                  >
                    Wybierz Starter
                  </button>
                </div>

                {/* Premium */}
                <div className="card-hover bg-white rounded-2xl p-8 border-2 border-purple-300">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-extrabold text-gray-900">149 zł</div>
                    <div className="text-gray-500 font-semibold mt-2">/ miesiąc</div>
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-purple-600">Unlimited</div>
                    <div className="text-sm text-gray-600 font-medium">postów miesięcznie</div>
                  </div>
                  <button
                    onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM!)}
                    className="btn-hover w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30"
                  >
                    Wybierz Pro
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative border-t border-gray-200 bg-gray-50 mt-24">
          <div className="max-w-7xl mx-auto px-6 py-12 text-center">
            <span className="text-2xl font-bold text-gray-900">PostujTo.pl</span>
            <p className="text-gray-600 text-sm font-medium mt-4">
              © 2025 PostujTo.pl - Generator postów AI dla social media
            </p>
            <p className="text-gray-500 text-sm mt-2">Wykonane z ❤️ w Polsce</p>
          </div>
        </footer>
      </div>
    </>
  );
}