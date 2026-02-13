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

    // Symulacja generowania - później podłączymy prawdziwe API
    setTimeout(() => {
      const mockResults = [
        {
          text: `Przykładowy post o ${topic}. To jest demo - wkrótce podłączymy prawdziwe AI!`,
          hashtags: ['#marketing', '#socialmedia', '#polska'],
          imagePrompt: `Nowoczesna grafika przedstawiająca ${topic}, profesjonalna fotografia produktowa`
        },
        {
          text: `Alternatywna wersja postu o ${topic}. AI wygeneruje tu prawdziwy content!`,
          hashtags: ['#biznes', '#digital', '#content'],
          imagePrompt: `Kolorowa ilustracja związana z ${topic}, styl minimalistyczny`
        }
      ];
      setResults(mockResults);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              PostujTo<span className="text-purple-400">.pl</span>
            </h1>
            <p className="text-sm text-purple-300 mt-1">Generator postów AI dla social media</p>
          </div>
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors">
            Zaloguj się
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Generuj posty w <span className="text-purple-400">sekundę</span>
          </h2>
          <p className="text-xl text-purple-200">
            AI stworzy dla Ciebie profesjonalne treści na Facebook i Instagram
          </p>
        </div>

        {/* Generator Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/20 shadow-2xl">
          <div className="space-y-6">
            {/* Topic Input */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                O czym ma być post?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="np. nowa kolekcja butów sportowych, przepis na ciasto czekoladowe..."
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Platforma
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPlatform('facebook')}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                    platform === 'facebook'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-white/5 text-purple-200 hover:bg-white/10'
                  }`}
                >
                  📘 Facebook
                </button>
                <button
                  onClick={() => setPlatform('instagram')}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                    platform === 'instagram'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-white/5 text-purple-200 hover:bg-white/10'
                  }`}
                >
                  📷 Instagram
                </button>
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Ton wypowiedzi
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              >
                <option value="professional">Profesjonalny</option>
                <option value="casual">Swobodny</option>
                <option value="humorous">Humorystyczny</option>
                <option value="sales">Sprzedażowy</option>
              </select>
            </div>

            {/* Length Selection */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Długość: {length === 'short' ? 'Krótki' : length === 'medium' ? 'Średni' : 'Długi'}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                value={length === 'short' ? 0 : length === 'medium' ? 1 : 2}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setLength(val === 0 ? 'short' : val === 1 ? 'medium' : 'long');
                }}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePost}
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-lg shadow-lg shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Generuję...' : '✨ Wygeneruj posty'}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-8 space-y-6">
            <h3 className="text-2xl font-bold text-white">Wygenerowane posty:</h3>
            {results.map((result, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                    Wersja {idx + 1}
                  </span>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                    📋 Kopiuj
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-purple-300 mb-2 font-medium">Tekst postu:</p>
                    <p className="text-white leading-relaxed">{result.text}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-purple-300 mb-2 font-medium">Hashtagi:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-900/50 text-purple-200 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-purple-300 mb-2 font-medium">Sugestia grafiki AI:</p>
                    <p className="text-white/80 text-sm italic">{result.imagePrompt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        {!results && (
          <div className="mt-16 text-center">
            <div className="inline-block bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <h3 className="text-2xl font-bold text-white mb-3">
                Pierwszy raz? To demo!
              </h3>
              <p className="text-purple-200 mb-6 max-w-md">
                Wypróbuj generator powyżej. Wkrótce dodamy prawdziwe AI, płatności i więcej funkcji.
              </p>
              <div className="flex gap-4 justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">10</div>
                  <div className="text-sm text-purple-300">postów/miesiąc</div>
                  <div className="text-xs text-purple-400 mt-1">Za darmo</div>
                </div>
                <div className="w-px bg-purple-500/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">100</div>
                  <div className="text-sm text-purple-300">postów/miesiąc</div>
                  <div className="text-xs text-purple-400 mt-1">49 zł</div>
                </div>
                <div className="w-px bg-purple-500/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">500</div>
                  <div className="text-sm text-purple-300">postów/miesiąc</div>
                  <div className="text-xs text-purple-400 mt-1">149 zł</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-black/20 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-purple-300 text-sm">
          <p>© 2025 PostujTo.pl - Generator postów AI. Wykonane z ❤️ w Polsce.</p>
        </div>
      </footer>
    </div>
  );
}