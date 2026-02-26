'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

type Plan = 'free' | 'standard' | 'premium';

const PLAN_LABELS: Record<Plan, string> = {
  free: 'FREE',
  standard: 'STANDARD',
  premium: 'PREMIUM',
};

const PLAN_COLORS: Record<Plan, string> = {
  free: 'bg-gray-100 text-gray-600',
  standard: 'bg-cyan-100 text-cyan-700',
  premium: 'bg-purple-100 text-purple-700',
};

export default function Home() {
  const { user, isLoaded } = useUser();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<'facebook' | 'instagram'>('facebook');
  const [tone, setTone] = useState<'professional' | 'casual' | 'humorous' | 'sales'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{
  text: string;
  hashtags: string[];
  imagePrompt: string;
}> | null>(null);
const [generationId, setGenerationId] = useState<string | null>(null);
const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

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
      alert('Zaloguj się aby kupić subskrypcję!');
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
        alert(data.error || 'Błąd podczas tworzenia sesji płatności');
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Błąd checkout:', err);
      alert('Wystąpił błąd. Spróbuj ponownie.');
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
        alert(data.error || 'Błąd podczas otwierania portalu');
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Błąd portalu:', err);
      alert('Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setPortalLoading(false);
    }
  };

  const generatePost = async () => {
    if (!topic.trim()) {
      alert('Wpisz temat postu!');
      return;
    }
    if (credits && credits.remaining <= 0) {
      alert('Brak kredytów! Przejdź na plan Standard lub Premium aby kontynuować.');
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, tone, length }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          alert(data.message || 'Brak kredytów!');
          return;
        }
        throw new Error(data.error || 'Błąd podczas generowania postów');
      }
      setGenerationId(data.generationId || null);
      setLikedPosts(new Set());
      setResults(data.posts.map((post: any) => ({
        text: post.text,
        hashtags: post.hashtags,
        imagePrompt: post.imagePrompt,
      })));
      if (data.creditsRemaining !== undefined) {
        setCredits(prev => prev ? {
          ...prev,
          remaining: data.creditsRemaining,
          total: data.creditsTotal || prev.total,
        } : null);
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Wystąpił błąd podczas generowania postów. Spróbuj ponownie.');
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

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.6); }
        }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .btn-hover {
          transition: all 0.25s ease;
        }
        .btn-hover:hover {
          transform: scale(1.08);
          filter: brightness(1.08);
        }
        .btn-hover:active {
          transform: scale(0.97);
        }
      `}</style>

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
                    {/* Plan badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${PLAN_COLORS[credits.plan]}`}>
                      {PLAN_LABELS[credits.plan]}
                    </span>
                    {/* Credits */}
                    <div className="px-4 py-2 bg-purple-100 rounded-full flex items-center gap-2">
                      <span className="text-sm font-bold text-purple-900">{credits.remaining}/{credits.total}</span>
                      <span className="text-xs text-purple-700">kredytów</span>
                    </div>
                    {/* Manage subscription button - only for paid plans */}
                    {hasActivePlan && (
                      <button
                        onClick={handleCustomerPortal}
                        disabled={portalLoading}
                        className="btn-hover px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-full disabled:opacity-50"
                      >
                        {portalLoading ? '⏳' : 'Subskrypcja'}
                      </button>
                    )}
                  </>
                )}
                <Link href="/dashboard" className="btn-hover px-4 py-2 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
  📊 Dashboard
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
                🚀 Nowa generacja content marketingu
              </span>
            </div>
            <h2 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Generuj posty<br />
              <span className="text-purple-600">w sekundę</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              AI stworzy dla Ciebie profesjonalne treści na Facebook i Instagram.<br />
              <span className="text-cyan-600 font-semibold">Zaoszczędź godziny pracy każdego dnia.</span>
            </p>
          </div>

          {/* Generator Form */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-10 shadow-2xl border border-gray-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-8">
              {/* Topic */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  O czym ma być post?
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="np. nowa kolekcja butów sportowych, przepis na ciasto czekoladowe..."
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 font-medium"
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Platforma</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['facebook', 'instagram'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`btn-hover relative px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${
                        platform === p
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {p === 'facebook' ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      )}
                      {p === 'facebook' ? 'Facebook' : 'Instagram'}
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
                      className={`btn-hover px-4 py-4 rounded-2xl font-bold ${
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
                      className={`btn-hover px-6 py-4 rounded-2xl font-bold ${
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
                      Wygeneruj posty AI
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
              </div>
              {results.map((result, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
                  <div className="flex items-start justify-between mb-6">
                    <span className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-full shadow-lg shadow-purple-500/30">
                      Wersja {idx + 1}
                    </span>
                    <div className="flex items-start justify-between mb-6">
  <span className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-full shadow-lg shadow-purple-500/30">
    Wersja {idx + 1}
  </span>
  <div className="flex gap-2">
    <button
      onClick={() => {
        const full = `${result.text}\n\n${result.hashtags.join(' ')}`;
        navigator.clipboard.writeText(full);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
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
          body: JSON.stringify({ id: generationId, is_favorite: newLiked.size > 0 }),
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
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Sugestia grafiki AI</p>
                      <div className="p-4 bg-cyan-50 border-2 border-cyan-200 rounded-xl">
                        <p className="text-cyan-900 text-sm font-medium italic">{result.imagePrompt}</p>
                      </div>
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
                    <div className="text-3xl font-bold text-purple-600">10</div>
                    <div className="text-sm text-gray-600 font-medium">postów miesięcznie</div>
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
                    <div className="text-3xl font-bold text-white">100</div>
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
                    <div className="text-3xl font-bold text-purple-600">500</div>
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

          {/* Active subscription card */}
          {!results && hasActivePlan && credits && (
            <div className="mt-20 max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white rounded-2xl p-8 border-2 border-purple-200 shadow-xl text-center">
                <div className="mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${PLAN_COLORS[credits.plan]}`}>
                    Plan {PLAN_LABELS[credits.plan]}
                  </span>
                </div>
                <div className="text-5xl font-extrabold text-gray-900 mb-2">
                  {credits.remaining}
                </div>
                <div className="text-gray-500 font-medium mb-6">
                  kredytów pozostało z {credits.total}
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((credits.remaining / credits.total) * 100)}%` }}
                  />
                </div>
                <button
                  onClick={handleCustomerPortal}
                  disabled={portalLoading}
                  className="btn-hover w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 disabled:opacity-50"
                >
                  {portalLoading ? '⏳ Ładowanie...' : '⚙️ Zarządzaj subskrypcją'}
                </button>
                <p className="text-xs text-gray-400 mt-3">Zmień plan lub anuluj subskrypcję</p>
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