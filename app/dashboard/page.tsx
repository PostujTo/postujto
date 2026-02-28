'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

type Post = {
  text: string;
  hashtags: string[];
  imagePrompt: string;
};

type Generation = {
  id: string;
  topic: string;
  platform: string;
  tone: string;
  length: string;
  generated_posts: Post[];
  is_favorite: boolean;
  liked_versions: number[];
  created_at: string;
};

type Stats = {
  total: number;
  favorites: number;
  facebook: number;
  instagram: number;
  tiktok: number;
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'facebook' | 'instagram' | 'tiktok'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) fetchData();
  }, [isLoaded, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setGenerations(data.generations || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Błąd:', err);
    } finally {
      setLoading(false);
    }
  };
const deleteGeneration = async (id: string) => {
  if (!confirm('Czy na pewno chcesz usunąć cały post?')) return;
  await fetch('/api/dashboard/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  const updated = generations.filter(g => g.id !== id);
  setGenerations(updated);
  setStats({
    total: updated.length,
    favorites: updated.filter(g => g.is_favorite).length,
    facebook: updated.filter(g => g.platform === 'facebook').length,
    instagram: updated.filter(g => g.platform === 'instagram').length,
tiktok: updated.filter(g => g.platform === 'tiktok').length,
  });
};

const deleteVersion = async (id: string, version_index: number) => {
  if (!confirm(`Czy na pewno chcesz usunąć wersję ${version_index + 1}?`)) return;
  const res = await fetch('/api/dashboard/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, version_index }),
  });
  const data = await res.json();
  
  if (data.deleted === 'all') {
    const updated = generations.filter(g => g.id !== id);
    setGenerations(updated);
    setStats({
      total: updated.length,
      favorites: updated.filter(g => g.is_favorite).length,
      facebook: updated.filter(g => g.platform === 'facebook').length,
      instagram: updated.filter(g => g.platform === 'instagram').length,
tiktok: updated.filter(g => g.platform === 'tiktok').length,
    });
  } else {
    setGenerations(prev => prev.map(g => {
      if (g.id !== id) return g;
      return {
        ...g,
        generated_posts: g.generated_posts.filter((_, i) => i !== version_index),
      };
    }));
  }
};
  const toggleFavorite = async (id: string, current: boolean) => {
  await fetch('/api/dashboard/favorite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_favorite: !current }),
  });
  const updated = generations.map(g => g.id === id ? { ...g, is_favorite: !current } : g);
  setGenerations(updated);
  setStats({
    total: updated.length,
    favorites: updated.filter(g => g.is_favorite).length,
    facebook: updated.filter(g => g.platform === 'facebook').length,
    instagram: updated.filter(g => g.platform === 'instagram').length,
tiktok: updated.filter(g => g.platform === 'tiktok').length,
  });
};

  const copyPost = (text: string, hashtags: string[], id: string) => {
    const full = `${text}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = 
  filter === 'favorites' ? generations.filter(g => g.is_favorite) :
  filter === 'facebook' ? generations.filter(g => g.platform === 'facebook') :
  filter === 'instagram' ? generations.filter(g => g.platform === 'instagram') :
  filter === 'tiktok' ? generations.filter(g => g.platform === 'tiktok') :
  generations;

  const toneLabel: Record<string, string> = {
    professional: 'Profesjonalny',
    casual: 'Swobodny',
    humorous: 'Humorystyczny',
    sales: 'Sprzedażowy',
  };

  const lengthLabel: Record<string, string> = {
    short: 'Krótki',
    medium: 'Średni',
    long: 'Długi',
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 font-medium">Ładowanie dashboardu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Musisz być zalogowany</p>
          <Link href="/" className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold">
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            PostujTo.pl
          </Link>
          <span className="text-gray-500 font-medium">📊 Dashboard</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Statystyki */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-extrabold text-purple-600">{stats.total}</div>
              <div className="text-sm text-gray-500 font-medium mt-1">Wygenerowanych postów</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-extrabold text-yellow-500">{stats.favorites}</div>
              <div className="text-sm text-gray-500 font-medium mt-1">Ulubionych</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-extrabold text-blue-500">{stats.facebook}</div>
              <div className="text-sm text-gray-500 font-medium mt-1">Facebook</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-extrabold text-pink-500">{stats.instagram}</div>
              <div className="text-sm text-gray-500 font-medium mt-1">Instagram</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
  <div className="text-4xl font-extrabold text-gray-900">{stats.tiktok}</div>
  <div className="text-sm text-gray-500 font-medium mt-1">🎵 TikTok</div>
</div>
          </div>
        )}

        {/* Filtry */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
  <button
    onClick={() => setFilter('all')}
    className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
      filter === 'all'
        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
        : 'bg-white text-gray-600 border border-gray-200'
    }`}
  >
    Wszystkie ({generations.length})
  </button>
  <button
    onClick={() => setFilter('favorites')}
    className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
      filter === 'favorites'
        ? 'bg-yellow-400 text-yellow-900 shadow-lg'
        : 'bg-white text-gray-600 border border-gray-200'
    }`}
  >
    ⭐ Ulubione ({generations.filter(g => g.is_favorite).length})
  </button>
  <button
    onClick={() => setFilter('facebook')}
    className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
      filter === 'facebook'
        ? 'bg-blue-500 text-white shadow-lg'
        : 'bg-white text-gray-600 border border-gray-200'
    }`}
  >
    Facebook ({generations.filter(g => g.platform === 'facebook').length})
  </button>
  <button
    onClick={() => setFilter('instagram')}
    className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
      filter === 'instagram'
        ? 'bg-pink-500 text-white shadow-lg'
        : 'bg-white text-gray-600 border border-gray-200'
    }`}
  >
    Instagram ({generations.filter(g => g.platform === 'instagram').length})
  </button>
  <button
  onClick={() => setFilter('tiktok')}
  className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
    filter === 'tiktok'
      ? 'bg-black text-white shadow-lg'
      : 'bg-white text-gray-600 border border-gray-200'
  }`}
>
  🎵 TikTok ({generations.filter(g => g.platform === 'tiktok').length})
</button>
</div>

        {/* Lista generacji */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{filter === 'favorites' ? '⭐' : '✨'}</div>
            <p className="text-gray-500 font-medium text-lg">
              {filter === 'favorites'
                ? 'Nie masz jeszcze ulubionych postów'
                : 'Nie masz jeszcze żadnych wygenerowanych postów'}
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 bg-purple-600 text-white rounded-full font-semibold"
            >
              Wygeneruj pierwszy post
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((gen) => (
              <div key={gen.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Nagłówek generacji */}
                <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100">
  {/* Temat */}
  <div className="flex items-start justify-between gap-4">
    <span className="text-lg font-bold text-gray-900 flex-1">{gen.topic}</span>
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs text-gray-400 whitespace-nowrap">
        {new Date(gen.created_at).toLocaleDateString('pl-PL', {
          day: 'numeric', month: 'short', year: 'numeric'
        })} {new Date(gen.created_at).toLocaleTimeString('pl-PL', {
          hour: '2-digit', minute: '2-digit'
        })}
      </span>
      <button
        onClick={() => toggleFavorite(gen.id, gen.is_favorite)}
        className="text-2xl transition-transform hover:scale-110"
        title={gen.is_favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
      >
        {gen.is_favorite ? '⭐' : '☆'}
      </button>
      <button
        onClick={() => deleteGeneration(gen.id)}
        className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors"
      >
        🗑️ Usuń post
      </button>
    </div>
  </div>
  {/* Tagi */}
  <div className="flex flex-wrap items-center gap-2">
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
      gen.platform === 'facebook'
        ? 'bg-blue-100 text-blue-700'
        : gen.platform === 'instagram'
        ? 'bg-pink-100 text-pink-700'
        : 'bg-black text-white'
    }`}>
      {gen.platform === 'tiktok' ? '🎵 TikTok' : gen.platform}
    </span>
    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
      {toneLabel[gen.tone]}
    </span>
    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
      {lengthLabel[gen.length]}
    </span>
  </div>
</div>

                {/* Posty */}
                <div className="divide-y divide-gray-50">
                  {gen.generated_posts.map((post, idx) => (
                    <div key={idx} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                            Wersja {idx + 1}
                            {gen.liked_versions?.includes(idx) && (
                            <span className="text-yellow-400">⭐ Polubiona</span>
                            )}
                          </p>
                          <p className="text-gray-800 leading-relaxed">{post.text}</p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {post.hashtags.map((tag, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
  <button
    onClick={() => copyPost(post.text, post.hashtags, `${gen.id}-${idx}`)}
    className="shrink-0 px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-600 transition-colors"
  >
    {copiedId === `${gen.id}-${idx}` ? '✅ Skopiowano!' : '📋 Kopiuj'}
  </button>
  <button
    onClick={() => deleteVersion(gen.id, idx)}
    className="shrink-0 px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors"
  >
    🗑️ Usuń wersję
  </button>
</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}