'use client';

import { useState } from 'react';

export default function Home() {
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

  const generatePost = async () => {
    if (!topic.trim()) {
      alert('Wpisz temat postu!');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      // Wywołanie prawdziwego API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          platform,
          tone,
          length,
        }),
      });

      if (!response.ok) {
        throw new Error('Błąd podczas generowania postów');
      }

      const data = await response.json();
      
      // Przekształć odpowiedź API na format który rozumie UI
      const formattedResults = data.posts.map((post: any) => ({
        text: post.text,
        hashtags: post.hashtags,
        imagePrompt: post.imagePrompt,
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error('Błąd:', error);
      alert('Wystąpił błąd podczas generowania postów. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');
        
        * {
          font-family: 'Lato', sans-serif;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.6);
          }
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* Header - 30% purple accent */}
        <header className="relative border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                PostujTo.pl
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">AI Social Media Generator</p>
            </div>
            <button className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105">
              Zaloguj się
            </button>
          </div>
        </header>

        {/* Main Content - 60% white background */}
        <main className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Hero Section */}
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

          {/* Generator Form - 30% purple */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-10 shadow-2xl border border-gray-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-8">
              {/* Topic Input */}
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

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Platforma
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPlatform('facebook')}
                    className={`relative px-6 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      platform === 'facebook'
                        ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                  <button
                    onClick={() => setPlatform('instagram')}
                    className={`relative px-6 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      platform === 'instagram'
                        ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </button>
                </div>
              </div>

              {/* Tone & Length Row */}
              <div className="space-y-6">
                {/* Tone Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    Ton wypowiedzi
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setTone('professional')}
                      className={`px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                        tone === 'professional'
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      Profesjonalny
                    </button>
                    <button
                      type="button"
                      onClick={() => setTone('casual')}
                      className={`px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                        tone === 'casual'
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      Swobodny
                    </button>
                    <button
                      type="button"
                      onClick={() => setTone('humorous')}
                      className={`px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                        tone === 'humorous'
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      Humorystyczny
                    </button>
                    <button
                      type="button"
                      onClick={() => setTone('sales')}
                      className={`px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                        tone === 'sales'
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      Sprzedażowy
                    </button>
                  </div>
                </div>

                {/* Length Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    Długość
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setLength('short')}
                      className={`px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                        length === 'short'
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold mb-1">Krótki</div>
                        <div className="text-xs opacity-80">~100 znaków</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLength('medium')}
                      className={`px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                        length === 'medium'
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold mb-1">Średni</div>
                        <div className="text-xs opacity-80">~250 znaków</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLength('long')}
                      className={`px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                        length === 'long'
                          ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/40 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold mb-1">Długi</div>
                        <div className="text-xs opacity-80">~500 znaków</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Generate Button - 10% cyan accent */}
              <div className="flex justify-center">
                <button
                  onClick={generatePost}
                  disabled={loading}
                  className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102 pulse-glow"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generuję posty...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
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
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  ✓ Gotowe!
                </span>
              </div>
              
              {results.map((result, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <span className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-full shadow-lg shadow-purple-500/30">
                      Wersja {idx + 1}
                    </span>
                    <button className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
                      📋 Kopiuj
                    </button>
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
                          <span key={i} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold">
                            {tag}
                          </span>
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

          {/* Pricing Preview - 30% purple */}
          {!results && (
            <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-center mb-10">
                <h3 className="text-4xl font-bold text-gray-900 mb-3">
                  Proste <span className="text-purple-600">ceny</span>
                </h3>
                <p className="text-gray-600 text-lg">Wybierz plan dopasowany do Twoich potrzeb</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Free */}
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-extrabold text-gray-900">0 zł</div>
                    <div className="text-gray-500 font-semibold mt-2">/ miesiąc</div>
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-purple-600">10</div>
                    <div className="text-sm text-gray-600 font-medium">postów miesięcznie</div>
                  </div>
                  <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all duration-300">
                    Start Free
                  </button>
                </div>

                {/* Starter - 10% cyan accent */}
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-8 shadow-2xl shadow-cyan-500/40 transform scale-105 relative">
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
                  <button className="w-full py-3 bg-white hover:bg-gray-50 text-cyan-600 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                    Wybierz Starter
                  </button>
                </div>

                {/* Pro - 30% purple */}
                <div className="bg-white rounded-2xl p-8 border-2 border-purple-300 hover:border-purple-400 transition-all duration-300 hover:shadow-xl">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-extrabold text-gray-900">149 zł</div>
                    <div className="text-gray-500 font-semibold mt-2">/ miesiąc</div>
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-purple-600">500</div>
                    <div className="text-sm text-gray-600 font-medium">postów miesięcznie</div>
                  </div>
                  <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl">
                    Wybierz Pro
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative border-t border-gray-200 bg-gray-50 mt-24">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  PostujTo.pl
                </span>
              </div>
              <p className="text-gray-600 text-sm font-medium">
                © 2025 PostujTo.pl - Generator postów AI dla social media
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Wykonane z ❤️ w Polsce
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
