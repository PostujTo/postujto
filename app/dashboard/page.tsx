'use client';

import { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

type Post = { text: string; hashtags: string[]; imagePrompt: string; };
type Performance = { likes?: number; reach?: number; comments?: number; shares?: number; };
type Generation = {
  id: string; topic: string; platform: string; tone: string; length: string;
  generated_posts: Post[]; is_favorite: boolean; liked_versions: number[]; created_at: string;
  ratings: Record<number, number>; performance?: Performance;
};
type Stats = { total: number; favorites: number; facebook: number; instagram: number; tiktok: number; };

const toneLabel: Record<string, string> = { professional: 'Profesjonalny', casual: 'Swobodny', humorous: 'Humorystyczny', sales: 'Sprzedażowy' };
const lengthLabel: Record<string, string> = { short: 'Krótki', medium: 'Średni', long: 'Długi' };

const PLATFORM_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  facebook: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: 'Facebook' },
  instagram: { bg: 'rgba(236,72,153,0.15)', color: '#f472b6', label: 'Instagram' },
  tiktok: { bg: 'rgba(255,255,255,0.08)', color: '#e2e8f0', label: 'TikTok' },
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'facebook' | 'instagram' | 'tiktok'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingRating, setPendingRating] = useState<string | null>(null);
  const [perfOpen, setPerfOpen] = useState<string | null>(null);
  const [perfDraft, setPerfDraft] = useState<Performance>({});
  const [perfSaving, setPerfSaving] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [gdprLoading, setGdprLoading] = useState(false);
const [deleteLoading, setDeleteLoading] = useState(false);
  const [credits, setCredits] = useState<{ plan: string; remaining: number; total: number } | null>(null);

const downloadGdprData = async () => {
  setGdprLoading(true);
  try {
    const res = await fetch('/api/user/gdpr-export');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postujto-dane-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch { alert('Błąd podczas pobierania danych. Spróbuj ponownie.'); }
  finally { setGdprLoading(false); }
};

const deleteAccount = async () => {
  if (!confirm('Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna — wszystkie Twoje posty i dane zostaną trwale usunięte.')) return;
  if (!confirm('Ostatnie potwierdzenie: usunąć konto bezpowrotnie?')) return;
  setDeleteLoading(true);
  try {
    const res = await fetch('/api/user/delete-account', { method: 'DELETE' });
    if (res.ok) {
      window.location.href = '/';
    } else {
      alert('Błąd podczas usuwania konta. Skontaktuj się z hello@postujto.com');
    }
  } catch { alert('Błąd połączenia. Spróbuj ponownie.'); }
  finally { setDeleteLoading(false); }
};

  const generateReport = async () => {
    setReportLoading(true);
    setReportOpen(true);
    try {
      const res = await fetch('/api/dashboard/report', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setReportData({ error: data.error }); return; }
      setReportData(data);
    } catch { setReportData({ error: 'Błąd połączenia' }); }
    finally { setReportLoading(false); }
  };

  const savePerformance = async (id: string) => {
    setPerfSaving(true);
    await fetch('/api/dashboard/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, performance: perfDraft }),
    });
    setGenerations(prev => prev.map(g => g.id !== id ? g : { ...g, performance: perfDraft }));
    setPerfSaving(false);
    setPerfOpen(null);
  };

  const rateVersion = async (id: string, version_index: number, rating: number) => {
    setPendingRating(`${id}-${version_index}`);
    await fetch('/api/dashboard/rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, version_index, rating }),
    });
    setGenerations(prev => prev.map(g => g.id !== id ? g : {
      ...g,
      ratings: { ...(g.ratings || {}), [version_index]: rating },
    }));
    setPendingRating(null);
  };

  useEffect(() => { if (isLoaded && user) fetchData(); }, [isLoaded, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [res, credRes] = await Promise.all([fetch('/api/dashboard'), fetch('/api/credits')]);
      const data = await res.json();
      setGenerations(data.generations || []);
      setStats(data.stats || null);
      const credData = await credRes.json();
      if (credData.plan) setCredits({ plan: credData.plan, remaining: credData.remaining, total: credData.total });
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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-dm-sans), sans-serif; background: #0a0a0f; color: #f0f0f5; }
        .font-family: var(--font-poppins), sans-serif;
        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,240,245,0.7); cursor: pointer; font-family: var(--font-dm-sans), sans-serif; font-weight: 500; transition: all 0.2s ease; }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); color: #f0f0f5; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; cursor: pointer; font-family: var(--font-dm-sans), sans-serif; font-weight: 600; transition: all 0.2s ease; }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .btn-danger { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.2); color: #f87171; cursor: pointer; font-family: var(--font-dm-sans), sans-serif; transition: all 0.2s ease; }
        .btn-danger:hover { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4); }
        .filter-btn { cursor: pointer; border: 1px solid rgba(255,255,255,0.08); font-family: var(--font-dm-sans), sans-serif; font-weight: 500; transition: all 0.2s ease; background: rgba(255,255,255,0.04); color: rgba(240,240,245,0.55); }
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
              <span className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                Postuj<span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>To</span>
              </span>
            </Link>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
              <Link href="/app" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '7px 18px', borderRadius: 9, fontSize: 13, border: 'none', background: 'transparent', color: 'rgba(240,240,245,0.5)' }}>
                  ✨ Generator
                </button>
              </Link>
              <Link href="/calendar" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '7px 18px', borderRadius: 9, fontSize: 13, border: 'none', background: 'transparent', color: 'rgba(240,240,245,0.5)' }}>
                  📅 Kalendarz
                </button>
              </Link>
              <button style={{ padding: '7px 18px', borderRadius: 9, fontSize: 13, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', cursor: 'default', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                📊 Dashboard
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 280, justifyContent: 'flex-end' }}>
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
              <Link href="/settings"><button className="btn-ghost" style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13 }}>🎨 Brand Kit</button></Link>
              <UserButton />
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

{/* REPORT BUTTON */}
          <div className="fade-up" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, animationDelay: '0.08s' }}>
            <button onClick={generateReport} disabled={reportLoading} className="btn-ghost"
              style={{ padding: '9px 20px', borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              {reportLoading ? 'Generuję...' : 'Raport miesięczny'}
            </button>
          </div>

          {/* REPORT MODAL */}
          {reportOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
              onClick={e => e.target === e.currentTarget && setReportOpen(false)}>
              <div style={{ width: '100%', maxWidth: 640, background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 36, maxHeight: '85vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                  <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800 }}>Raport miesięczny</h2>
                  <button onClick={() => setReportOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'rgba(240,240,245,0.4)' }}>✕</button>
                </div>

                {reportLoading && (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
                    <p style={{ color: 'rgba(240,240,245,0.5)' }}>Claude analizuje Twoje posty...</p>
                  </div>
                )}

                {!reportLoading && reportData?.error && (
                  <div style={{ padding: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12 }}>
                    <p style={{ color: '#f87171', fontSize: 14 }}>❌ {reportData.error}</p>
                  </div>
                )}

                {!reportLoading && reportData?.report && (() => {
                  const r = reportData.report;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {/* Summary */}
                      <div style={{ padding: '18px 20px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Podsumowanie • {reportData.postsCount} postów</p>
                        <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.75)', lineHeight: 1.7 }}>{r.summary}</p>
                      </div>

                      {/* Top insights */}
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>💡 Kluczowe obserwacje</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {r.topInsights?.map((insight: string, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                              <span style={{ color: '#a5b4fc', flexShrink: 0 }}>→</span>
                              <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.7)', lineHeight: 1.6 }}>{insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Best platform */}
                      <div style={{ padding: '16px 20px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>🏆 Najlepsza platforma</p>
                        <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.75)', lineHeight: 1.7 }}>{r.bestPlatform}</p>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>🎯 Rekomendacje</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {r.recommendations?.map((rec: string, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 10 }}>
                              <span style={{ color: '#a855f7', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                              <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.7)', lineHeight: 1.6 }}>{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Next month */}
                      <div style={{ padding: '16px 20px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>📅 Następny miesiąc</p>
                        <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.75)', lineHeight: 1.7 }}>{r.nextMonthTips}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

{/* RODO */}
<div className="fade-up" style={{ marginBottom: 28, padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, animationDelay: '0.09s' }}>
  <div>
    <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(240,240,245,0.7)', marginBottom: 4 }}>Twoje dane osobowe</p>
    <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.3)', lineHeight: 1.5 }}>Zgodnie z RODO możesz pobrać kopię swoich danych lub trwale usunąć konto.</p>
  </div>
  <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
    <button onClick={downloadGdprData} disabled={gdprLoading} className="btn-ghost"
      style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
      {gdprLoading ? '⏳ Pobieranie...' : '📥 Pobierz moje dane'}
    </button>
    <button onClick={deleteAccount} disabled={deleteLoading}
      className="btn-danger" style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
      {deleteLoading ? '⏳ Usuwanie...' : '🗑️ Usuń konto'}
    </button>
  </div>
</div>

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
                            {/* Ocena wersji */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.3)' }}>Oceń:</span>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {[1, 2, 3, 4, 5].map(star => {
                                  const currentRating = gen.ratings?.[idx] || 0;
                                  const isLoading = pendingRating === `${gen.id}-${idx}`;
                                  return (
                                    <button key={star} onClick={() => rateVersion(gen.id, idx, star)}
                                      disabled={isLoading}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px', transition: 'transform 0.15s', opacity: isLoading ? 0.5 : 1, transform: 'scale(1)', color: star <= currentRating ? '#fbbf24' : 'rgba(240,240,245,0.2)' }}
                                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    >★</button>
                                  );
                                })}
                              </div>
                              {gen.ratings?.[idx] && (
                                <span style={{ fontSize: 11, color: gen.ratings[idx] >= 4 ? '#4ade80' : gen.ratings[idx] >= 3 ? '#fbbf24' : 'rgba(240,240,245,0.3)' }}>
                                  {gen.ratings[idx] === 5 ? 'Świetny!' : gen.ratings[idx] === 4 ? 'Dobry' : gen.ratings[idx] === 3 ? 'Przeciętny' : gen.ratings[idx] === 2 ? 'Słaby' : 'Zły'}
                                </span>
                              )}
                            </div>
                            {/* Wyniki posta */}
                            {idx === 0 && (
                              <div style={{ marginTop: 10 }}>
                                {perfOpen === gen.id ? (
                                  <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,240,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>📊 Wyniki posta</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                                      {([
                                        { key: 'likes', label: '❤️ Lajki', placeholder: 'np. 124' },
                                        { key: 'reach', label: '👁️ Zasięg', placeholder: 'np. 2400' },
                                        { key: 'comments', label: '💬 Komentarze', placeholder: 'np. 18' },
                                        { key: 'shares', label: '🔁 Udostępnienia', placeholder: 'np. 7' },
                                      ] as const).map(field => (
                                        <div key={field.key}>
                                          <label style={{ fontSize: 11, color: 'rgba(240,240,245,0.35)', display: 'block', marginBottom: 4 }}>{field.label}</label>
                                          <input
                                            type="number"
                                            min={0}
                                            placeholder={field.placeholder}
                                            value={perfDraft[field.key] ?? gen.performance?.[field.key] ?? ''}
                                            onChange={e => setPerfDraft(prev => ({ ...prev, [field.key]: e.target.value ? Number(e.target.value) : undefined }))}
                                            style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0f5', fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                      <button onClick={() => savePerformance(gen.id)} disabled={perfSaving}
                                        className="btn-primary" style={{ flex: 1, padding: '8px', borderRadius: 9, fontSize: 13 }}>
                                        {perfSaving ? '⏳ Zapisuję...' : '✅ Zapisz wyniki'}
                                      </button>
                                      <button onClick={() => setPerfOpen(null)} className="btn-ghost"
                                        style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13 }}>
                                        Anuluj
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    {gen.performance && Object.keys(gen.performance).length > 0 ? (
                                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                        {gen.performance.likes !== undefined && <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.5)' }}>❤️ {gen.performance.likes}</span>}
                                        {gen.performance.reach !== undefined && <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.5)' }}>👁️ {gen.performance.reach}</span>}
                                        {gen.performance.comments !== undefined && <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.5)' }}>💬 {gen.performance.comments}</span>}
                                        {gen.performance.shares !== undefined && <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.5)' }}>🔁 {gen.performance.shares}</span>}
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.2)' }}>Brak wyników</span>
                                    )}
                                    <button onClick={() => { setPerfOpen(gen.id); setPerfDraft(gen.performance || {}); }}
                                      className="btn-ghost" style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12 }}>
                                      📊 {gen.performance && Object.keys(gen.performance).length > 0 ? 'Edytuj wyniki' : 'Dodaj wyniki'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
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
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>PostujTo.com</Link> · © 2026 · Wykonane z ❤️ w Polsce
          </p>
        </footer>
      </div>
    </>
  );
}