'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

type Post = { text: string; hashtags: string[]; imagePrompt: string; };
type Generation = {
  id: string; topic: string; platform: string; tone: string; length: string;
  generated_posts: Post[]; is_favorite: boolean; liked_versions: number[]; created_at: string;
};
type Stats = { total: number; favorites: number; facebook: number; instagram: number; tiktok: number; };

const toneLabel: Record<string, string> = { professional: 'Profesjonalny', casual: 'Swobodny', humorous: 'Humorystyczny', sales: 'Sprzedażowy' };
const lengthLabel: Record<string, string> = { short: 'Krótki', medium: 'Średni', long: 'Długi' };

const PLATFORM_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  facebook: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: 'Facebook' },
  instagram: { bg: 'rgba(236,72,153,0.15)', color: '#f472b6', label: 'Instagram' },
  tiktok: { bg: 'rgba(255,255,255,0.08)', color: '#e2e8f0', label: '🎵 TikTok' },
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'facebook' | 'instagram' | 'tiktok'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { if (isLoaded && user) fetchData(); }, [isLoaded, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setGenerations(data.generations || []);
      setStats(data.stats || null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const recalcStats = (gens: Generation[]) => ({
    total: gens.length,
    favorites: gens.filter(g => g.is_favorite).length,
    facebook: gens.filter(g => g.platform === 'facebook').length,
    instagram: gens.filter(g => g.platform === 'instagram').length,
    tiktok: gens.filter(g => g.platform === 'tiktok').length,
  });

  const deleteGeneration = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten post?')) return;
    await fetch('/api/dashboard/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const updated = generations.filter(g => g.id !== id);
    setGenerations(updated); setStats(recalcStats(updated));
  };

  const deleteVersion = async (id: string, version_index: number) => {
    if (!confirm(`Usunąć wersję ${version_index + 1}?`)) return;
    const res = await fetch('/api/dashboard/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, version_index }) });
    const data = await res.json();
    if (data.deleted === 'all') {
      const updated = generations.filter(g => g.id !== id);
      setGenerations(updated); setStats(recalcStats(updated));
    } else {
      setGenerations(prev => prev.map(g => g.id !== id ? g : { ...g, generated_posts: g.generated_posts.filter((_, i) => i !== version_index) }));
    }
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    await fetch('/api/dashboard/favorite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_favorite: !current }) });
    const updated = generations.map(g => g.id === id ? { ...g, is_favorite: !current } : g);
    setGenerations(updated); setStats(recalcStats(updated));
  };

  const copyPost = (text: string, hashtags: string[], id: string) => {
    navigator.clipboard.writeText(`${text}\n\n${hashtags.join(' ')}`);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered =
    filter === 'favorites' ? generations.filter(g => g.is_favorite) :
    filter === 'facebook' ? generations.filter(g => g.platform === 'facebook') :
    filter === 'instagram' ? generations.filter(g => g.platform === 'instagram') :
    filter === 'tiktok' ? generations.filter(g => g.platform === 'tiktok') :
    generations;

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ color: 'rgba(240,240,245,0.5)', fontSize: 16 }}>Ładowanie dashboardu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(240,240,245,0.5)', marginBottom: 20 }}>Musisz być zalogowany</p>
          <Link href="/" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Wróć do strony głównej</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #f0f0f5; }
        .font-display { font-family: 'Poppins', sans-serif; }
        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,240,245,0.7); cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.2s ease; }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); color: #f0f0f5; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; transition: all 0.2s ease; }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .btn-danger { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.2); color: #f87171; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s ease; }
        .btn-danger:hover { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4); }
        .filter-btn { cursor: pointer; border: 1px solid rgba(255,255,255,0.08); font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.2s ease; background: rgba(255,255,255,0.04); color: rgba(240,240,245,0.55); }
        .filter-btn:hover { background: rgba(255,255,255,0.08); color: #f0f0f5; }
        .filter-btn.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.5); color: #a5b4fc; }
        .gen-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; transition: border-color 0.25s ease; overflow: hidden; }
        .gen-card:hover { border-color: rgba(99,102,241,0.25); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease-out forwards; }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="font-display" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f0f0f5' }}>
                Postuj<span className="gradient-text">To</span>
              </span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href="/app">
                <button className="btn-primary" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13 }}>✨ Generator</button>
              </Link>
              <Link href="/settings">
                <button className="btn-ghost" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13 }}>Ustawienia</button>
              </Link>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '48px 24px 80px' }}>

          {/* Page title */}
          <div className="fade-up" style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Historia</p>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Panel <span className="gradient-text">użytkownika</span>
            </h1>
          </div>

          {/* STATS */}
          {stats && (
            <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 36, animationDelay: '0.05s' }}>
              {[
                { value: stats.total, label: 'Postów', color: '#a5b4fc', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
                { value: stats.favorites, label: 'Ulubionych', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
                { value: stats.facebook, label: 'Facebook', color: '#60a5fa', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
                { value: stats.instagram, label: 'Instagram', color: '#f472b6', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)' },
                { value: stats.tiktok, label: 'TikTok', color: '#e2e8f0', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
              ].map((stat, i) => (
                <div key={i} style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
                  <div className="font-display" style={{ fontSize: 32, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,240,245,0.45)', marginTop: 6 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* FILTERS */}
          <div className="fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28, animationDelay: '0.1s' }}>
            {[
              { key: 'all', label: `Wszystkie (${generations.length})` },
              { key: 'favorites', label: `⭐ Ulubione (${generations.filter(g => g.is_favorite).length})` },
              { key: 'facebook', label: `Facebook (${generations.filter(g => g.platform === 'facebook').length})` },
              { key: 'instagram', label: `Instagram (${generations.filter(g => g.platform === 'instagram').length})` },
              { key: 'tiktok', label: `🎵 TikTok (${generations.filter(g => g.platform === 'tiktok').length})` },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key as any)}
                className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13 }}
              >{f.label}</button>
            ))}
          </div>

          {/* EMPTY STATE */}
          {filtered.length === 0 ? (
            filter === 'favorites' ? (
              <div className="glass-card fade-up" style={{ padding: '64px 40px', textAlign: 'center', animationDelay: '0.15s' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>⭐</div>
                <h3 className="font-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: 'rgba(240,240,245,0.8)' }}>Brak ulubionych postów</h3>
                <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.35)', marginBottom: 28 }}>Kliknij gwiazdkę ☆ przy wersji posta w generatorze żeby dodać do ulubionych.</p>
                <Link href="/app">
                  <button className="btn-primary" style={{ padding: '12px 28px', borderRadius: 12, fontSize: 14 }}>✨ Przejdź do generatora</button>
                </Link>
              </div>
            ) : (
              <div className="fade-up" style={{ animationDelay: '0.15s' }}>
                {/* Hero empty state */}
                <div className="glass-card" style={{ padding: '56px 40px', textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ fontSize: 56, marginBottom: 20 }}>🚀</div>
                  <h3 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: '#f0f0f5' }}>
                    Witaj w PostujTo!
                  </h3>
                  <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.45)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
                    Wygeneruj swój pierwszy post AI w mniej niż 30 sekund. Żadnych szablonów — każdy post pisany specjalnie dla Ciebie.
                  </p>
                  <Link href="/app">
                    <button className="btn-primary" style={{ padding: '14px 36px', borderRadius: 14, fontSize: 16 }}>✨ Wygeneruj pierwszy post</button>
                  </Link>
                </div>

                {/* Mini-tutorial */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                  {[
                    { step: '1', emoji: '✍️', title: 'Wpisz temat', desc: 'Napisz o czym ma być post — np. "nowa kolekcja butów" lub "promocja weekendowa".' },
                    { step: '2', emoji: '⚙️', title: 'Wybierz platformę i ton', desc: 'Facebook, Instagram lub TikTok. Profesjonalny, swobodny, humorystyczny lub sprzedażowy.' },
                    { step: '3', emoji: '🎉', title: 'Gotowe!', desc: 'Claude generuje 3 wersje posta z hashtagami i opisem grafiki AI. Kopiuj i publikuj.' },
                  ].map(item => (
                    <div key={item.step} className="glass-card" style={{ padding: '28px 24px', textAlign: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 14, fontWeight: 700, color: '#a5b4fc', fontFamily: "'Poppins', sans-serif" }}>
                        {item.step}
                      </div>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>{item.emoji}</div>
                      <p className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#f0f0f5' }}>{item.title}</p>
                      <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Brand Kit tip */}
                <div style={{ padding: '20px 24px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>💡</div>
                  <div style={{ flex: 1 }}>
                    <p className="font-display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: '#a5b4fc' }}>Wskazówka: skonfiguruj Brand Kit</p>
                    <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.45)', lineHeight: 1.5 }}>Dodaj nazwę firmy, kolory i przykładowe posty w Ustawieniach — Claude będzie generował posty dopasowane do Twojej marki.</p>
                  </div>
                  <Link href="/settings" style={{ flexShrink: 0 }}>
                    <button className="btn-ghost" style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13 }}>Skonfiguruj →</button>
                  </Link>
                </div>
              </div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map((gen, gi) => {
                const isExpanded = expandedId === gen.id;
                const ps = PLATFORM_STYLES[gen.platform] || PLATFORM_STYLES.facebook;
                return (
                  <div key={gen.id} className="gen-card fade-up" style={{ animationDelay: `${0.1 + gi * 0.04}s` }}>

                    {/* Card header */}
                    <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16, justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Topic */}
                        <p className="font-display" style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f5', marginBottom: 10, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {gen.topic}
                        </p>
                        {/* Tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: ps.bg, color: ps.color, border: `1px solid ${ps.color}33` }}>
                            {ps.label}
                          </span>
                          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,245,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {toneLabel[gen.tone]}
                          </span>
                          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,245,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {lengthLabel[gen.length]}
                          </span>
                          <span style={{ fontSize: 11, color: 'rgba(240,240,245,0.25)', marginLeft: 4 }}>
                            {new Date(gen.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' '}
                            {new Date(gen.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => toggleFavorite(gen.id, gen.is_favorite)}
                          style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', lineHeight: 1 }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >{gen.is_favorite ? '⭐' : '☆'}</button>
                        <button onClick={() => setExpandedId(isExpanded ? null : gen.id)}
                          className="btn-ghost" style={{ padding: '7px 14px', borderRadius: 9, fontSize: 13 }}>
                          {isExpanded ? '▲ Zwiń' : `▼ Pokaż (${gen.generated_posts.length})`}
                        </button>
                        <button onClick={() => deleteGeneration(gen.id)}
                          className="btn-danger" style={{ padding: '7px 12px', borderRadius: 9, fontSize: 13 }}>
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Expanded versions */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {gen.generated_posts.map((post, idx) => (
                          <div key={idx} style={{ padding: '20px 24px', borderBottom: idx < gen.generated_posts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                            {/* Version header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)', letterSpacing: '0.05em' }}>
                                  WERSJA {idx + 1}
                                </span>
                                {gen.liked_versions?.includes(idx) && (
                                  <span style={{ fontSize: 12, color: '#fbbf24' }}>⭐ Polubiona</span>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => copyPost(post.text, post.hashtags, `${gen.id}-${idx}`)}
                                  className="btn-ghost" style={{ padding: '6px 14px', borderRadius: 9, fontSize: 12 }}>
                                  {copiedId === `${gen.id}-${idx}` ? '✅ Skopiowano' : '📋 Kopiuj'}
                                </button>
                                <button onClick={() => deleteVersion(gen.id, idx)}
                                  className="btn-danger" style={{ padding: '6px 12px', borderRadius: 9, fontSize: 12 }}>
                                  🗑️ Usuń
                                </button>
                              </div>
                            </div>

                            {/* Post text */}
                            <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.8)', lineHeight: 1.75, marginBottom: 14 }}>{post.text}</p>

                            {/* Hashtags */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {post.hashtags.map((tag, i) => (
                                <span key={i} style={{ fontSize: 12, padding: '4px 10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 8, color: '#818cf8' }}>{tag}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.2)' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>PostujTo.com</Link> · © 2025 · Wykonane z ❤️ w Polsce
          </p>
        </footer>
      </div>
    </>
  );
}