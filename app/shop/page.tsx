'use client';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Connection {
  id: string;
  platform: 'baselinker' | 'shoper' | 'allegro';
  shop_name: string;
  shop_url: string | null;
  last_sync_at: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  image_url: string | null;
  category: string | null;
  sku: string | null;
  last_post_generated_at: string | null;
}

const PLATFORM_LABELS: Record<string, string> = {
  baselinker: 'BaseLinker',
  shoper: 'Shoper',
  allegro: 'Allegro',
};

const PLATFORM_ICONS: Record<string, string> = {
  baselinker: '🔗',
  shoper: '🛒',
  allegro: '🛍️',
};

const ERROR_MESSAGES: Record<string, string> = {
  allegro_auth_failed: 'Autoryzacja Allegro nie powiodla sie. Sprobuj ponownie.',
  plan_limit: 'Osiagnales limit polaczonych sklepow dla swojego planu.',
  allegro_callback_failed: 'Blad podczas laczenia z Allegro. Sprobuj ponownie.',
  user_not_found: 'Nie znaleziono uzytkownika.',
};

function formatSyncTime(isoStr: string | null): string {
  if (!isoStr) return 'Nigdy';
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'przed chwila';
  if (min < 60) return min + ' min temu';
  const h = Math.floor(min / 60);
  if (h < 24) return h + ' godz. temu';
  return Math.floor(h / 24) + ' dni temu';
}

const S = {
  page: { minHeight: '100vh', background: '#0a0a0f', fontFamily: '"DM Sans", sans-serif', color: '#f0f0f5', padding: '32px 24px 80px' } as React.CSSProperties,
  container: { maxWidth: 900, margin: '0 auto' } as React.CSSProperties,
  title: { fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#f0f0f5' } as React.CSSProperties,
  subtitle: { fontSize: 15, color: 'rgba(240,240,245,0.5)', margin: '0 0 32px' } as React.CSSProperties,
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 16 } as React.CSSProperties,
  btn: { padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s' } as React.CSSProperties,
  btnPrimary: { background: '#6C47FF', color: '#fff' } as React.CSSProperties,
  btnGhost: { background: 'rgba(255,255,255,0.06)', color: 'rgba(240,240,245,0.7)', border: '1px solid rgba(255,255,255,0.1)' } as React.CSSProperties,
  btnDanger: { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' } as React.CSSProperties,
  input: { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' as const, outline: 'none' } as React.CSSProperties,
  label: { display: 'block', fontSize: 13, color: 'rgba(240,240,245,0.6)', marginBottom: 6 } as React.CSSProperties,
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 } as React.CSSProperties,
  modal: { background: '#16162a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' as const } as React.CSSProperties,
  modalTitle: { fontSize: 20, fontWeight: 700, margin: '0 0 24px', color: '#f0f0f5' } as React.CSSProperties,
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 14, marginBottom: 16 } as React.CSSProperties,
  chip: (active: boolean) => ({ padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', border: '1px solid', borderColor: active ? '#6C47FF' : 'rgba(255,255,255,0.12)', background: active ? 'rgba(108,71,255,0.2)' : 'rgba(255,255,255,0.04)', color: active ? '#a5b4fc' : 'rgba(240,240,245,0.6)', transition: 'all 0.15s' }) as React.CSSProperties,
};

export default function ShopPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [plan, setPlan] = useState<string>('free');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConn, setSelectedConn] = useState<Connection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsOffset, setProductsOffset] = useState(0);
  const [productsLoading, setProductsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [connectModal, setConnectModal] = useState<'baselinker' | 'shoper' | null>(null);
  const [formApiKey, setFormApiKey] = useState('');
  const [formShopUrl, setFormShopUrl] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!user) return;
    fetch('/api/credits').then(r => r.ok ? r.json() : null).then(d => { if (d?.plan) setPlan(d.plan); }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError && ERROR_MESSAGES[urlError]) setError(ERROR_MESSAGES[urlError]);
    const connected = params.get('connected');
    if (connected) loadConnections();
  }, []);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/shop/connect');
      const data = await r.json();
      setConnections(data.connections || []);
    } catch {
      setError('Blad ladowania polaczen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) loadConnections(); }, [user, loadConnections]);

  const loadProducts = useCallback(async (conn: Connection, searchVal = '', offset = 0) => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({ connection_id: conn.id, limit: '20', offset: String(offset), search: searchVal });
      const r = await fetch('/api/shop/products?' + params.toString());
      const data = await r.json();
      setProducts(data.products || []);
      setProductsTotal(data.total || 0);
    } catch {
      setError('Blad ladowania produktow');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const handleSelectConn = (conn: Connection) => {
    setSelectedConn(conn);
    setSearch('');
    setProductsOffset(0);
    loadProducts(conn);
  };

  const handleConnect = async () => {
    if (!connectModal) return;
    setConnecting(true);
    setError(null);
    try {
      const body: Record<string, string> = { platform: connectModal, api_key: formApiKey };
      if (connectModal === 'shoper') body.shop_url = formShopUrl;
      const r = await fetch('/api/shop/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Blad polaczenia');
      setConnectModal(null);
      setFormApiKey('');
      setFormShopUrl('');
      await loadConnections();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleAllegroConnect = async () => {
    try {
      const r = await fetch('/api/shop/allegro/authorize');
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Blad autoryzacji');
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSync = async () => {
    if (!selectedConn) return;
    setSyncing(true);
    setError(null);
    try {
      const r = await fetch('/api/shop/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: selectedConn.id }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Blad synchronizacji');
      await loadConnections();
      await loadProducts(selectedConn, search, productsOffset);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async (conn: Connection) => {
    if (!window.confirm('Odlaczyc sklep ' + PLATFORM_LABELS[conn.platform] + '? Wszystkie produkty zostana usuniete z PostujTo.')) return;
    setError(null);
    try {
      const r = await fetch('/api/shop/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: conn.id }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Blad rozlaczania'); }
      if (selectedConn?.id === conn.id) setSelectedConn(null);
      await loadConnections();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleGeneratePost = (product: Product) => {
    const parts: string[] = [product.name];
    if (product.price > 0) parts.push('w cenie ' + product.price.toFixed(2) + ' ' + (product.currency || 'PLN'));
    const topic = parts.join(' — ');
    router.push('/app?topic=' + encodeURIComponent(topic) + '&product_id=' + product.id);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setProductsOffset(0);
    if (selectedConn) loadProducts(selectedConn, val, 0);
  };

  if (!isLoaded || !user) return <div style={{ minHeight: '100vh', background: '#0a0a0f' }} />;

  const isFree = plan === 'free';
  const planLimit = plan === 'premium' ? 3 : plan === 'standard' ? 1 : 0;
  const canAddMore = connections.length < planLimit;

  return (
    <div style={S.page}>
      <div style={S.container}>
        <h1 style={S.title}>Sklep</h1>
        <p style={S.subtitle}>Polacz sklep i generuj posty produktowe jednym kliknieciem</p>

        {error && (
          <div style={S.error}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
        )}

        {isFree ? (
          <div style={{ ...S.card, textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>Funkcja dla planow Starter i Pro</h2>
            <p style={{ color: 'rgba(240,240,245,0.5)', margin: '0 0 24px', fontSize: 15 }}>
              Polacz swoj sklep, importuj produkty i generuj posty AI jednym kliknieciem.
            </p>
            <a href="/pricing" style={{ ...S.btn, ...S.btnPrimary, textDecoration: 'none', display: 'inline-flex' }}>
              Przejdz na Starter →
            </a>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'rgba(240,240,245,0.4)' }}>Ladowanie...</div>
        ) : selectedConn ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedConn(null)} style={{ ...S.btn, ...S.btnGhost, padding: '8px 14px' }}>
                ← Powrot
              </button>
              <span style={{ fontSize: 18, fontWeight: 700 }}>
                {PLATFORM_ICONS[selectedConn.platform]} {selectedConn.shop_name || PLATFORM_LABELS[selectedConn.platform]}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)' }}>
                Sync: {formatSyncTime(selectedConn.last_sync_at)}
              </span>
              <button onClick={handleSync} disabled={syncing} style={{ ...S.btn, ...S.btnGhost, marginLeft: 'auto' }}>
                {syncing ? 'Synchronizuje...' : '↻ Synchronizuj'}
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Szukaj produktu..."
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                style={S.input}
              />
            </div>

            {productsLoading ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'rgba(240,240,245,0.4)' }}>Ladowanie produktow...</div>
            ) : products.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: 32 }}>
                <p style={{ color: 'rgba(240,240,245,0.4)', margin: 0 }}>
                  {search ? 'Brak produktow dla "' + search + '"' : 'Brak produktow. Kliknij Synchronizuj, aby pobrac produkty.'}
                </p>
              </div>
            ) : (
              <>
                <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                  {products.map((product, idx) => (
                    <div key={product.id} style={{
                      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                      borderBottom: idx < products.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🖼</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.5)' }}>
                          {product.price > 0 ? product.price.toFixed(2) + ' ' + (product.currency || 'PLN') : 'Brak ceny'}
                          {product.sku && ' · SKU: ' + product.sku}
                          {product.last_post_generated_at && ' · Post: ' + formatSyncTime(product.last_post_generated_at)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleGeneratePost(product)}
                        style={{ ...S.btn, ...S.btnPrimary, flexShrink: 0, fontSize: 13, padding: '8px 14px' }}
                      >
                        ✨ Generuj post
                      </button>
                    </div>
                  ))}
                </div>

                {productsTotal > 20 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                    <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)' }}>
                      {productsOffset + 1}–{Math.min(productsOffset + 20, productsTotal)} z {productsTotal}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { const o = Math.max(0, productsOffset - 20); setProductsOffset(o); if (selectedConn) loadProducts(selectedConn, search, o); }}
                        disabled={productsOffset === 0}
                        style={{ ...S.btn, ...S.btnGhost, opacity: productsOffset === 0 ? 0.4 : 1 }}
                      >← Poprzednia</button>
                      <button
                        onClick={() => { const o = productsOffset + 20; setProductsOffset(o); if (selectedConn) loadProducts(selectedConn, search, o); }}
                        disabled={productsOffset + 20 >= productsTotal}
                        style={{ ...S.btn, ...S.btnGhost, opacity: productsOffset + 20 >= productsTotal ? 0.4 : 1 }}
                      >Nastepna →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {connections.length > 0 && (
              <>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'rgba(240,240,245,0.7)' }}>Polaczone sklepy</h2>
                {connections.map(conn => (
                  <div key={conn.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 28 }}>{PLATFORM_ICONS[conn.platform]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{conn.shop_name || PLATFORM_LABELS[conn.platform]}</div>
                      <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', marginTop: 2 }}>
                        {PLATFORM_LABELS[conn.platform]} · Ostatni sync: {formatSyncTime(conn.last_sync_at)}
                      </div>
                    </div>
                    <button onClick={() => handleSelectConn(conn)} style={{ ...S.btn, ...S.btnPrimary }}>
                      Produkty →
                    </button>
                    <button onClick={() => handleDisconnect(conn)} style={{ ...S.btn, ...S.btnDanger }}>
                      Odlacz
                    </button>
                  </div>
                ))}
              </>
            )}

            {(connections.length === 0 || canAddMore) && (
              <>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: connections.length > 0 ? '24px 0 12px' : '0 0 12px', color: 'rgba(240,240,245,0.7)' }}>
                  {connections.length === 0 ? 'Polacz swoj sklep' : 'Dodaj kolejny sklep'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {[
                    { key: 'baselinker' as const, label: 'BaseLinker', desc: 'Hub e-commerce: WooCommerce, Allegro, Shoper i 100+ platform' },
                    { key: 'shoper' as const, label: 'Shoper', desc: 'Bezposrednia integracja z API Shoper' },
                    { key: 'allegro' as const, label: 'Allegro', desc: 'Marketplace — oferty sprzedawcy przez OAuth2' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} style={{ ...S.card, textAlign: 'center', padding: 24 }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>{PLATFORM_ICONS[key]}</div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', marginBottom: 20, lineHeight: 1.4 }}>{desc}</div>
                      <button
                        onClick={() => key === 'allegro' ? handleAllegroConnect() : setConnectModal(key)}
                        style={{ ...S.btn, ...S.btnPrimary, width: '100%', justifyContent: 'center' }}
                      >
                        Polacz →
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {connections.length === 0 && (
              <div style={{ marginTop: 48, padding: '24px', background: 'rgba(108,71,255,0.06)', borderRadius: 12, border: '1px solid rgba(108,71,255,0.15)' }}>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(240,240,245,0.5)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'rgba(240,240,245,0.8)' }}>Jak to dziala?</strong><br />
                  1. Polacz sklep (Baselinker, Shoper lub Allegro)<br />
                  2. PostujTo importuje Twoje produkty automatycznie<br />
                  3. Kliknij "Generuj post" przy dowolnym produkcie<br />
                  4. Claude AI tworzy post w stylu Twojej marki z cena jako CTA
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: Connect Baselinker */}
      {connectModal === 'baselinker' && (
        <div style={S.overlay} onClick={() => setConnectModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={S.modalTitle}>Polacz BaseLinker</h2>
            {error && <div style={S.error}>{error}</div>}
            <label style={S.label}>Klucz API BaseLinker</label>
            <input
              type="text"
              placeholder="Wklej klucz API..."
              value={formApiKey}
              onChange={e => setFormApiKey(e.target.value)}
              style={{ ...S.input, marginBottom: 8 }}
              autoFocus
            />
            <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', margin: '0 0 24px' }}>
              Gdzie znalezc klucz? BaseLinker Dashboard → Moje konto → API
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setConnectModal(null); setFormApiKey(''); setError(null); }} style={{ ...S.btn, ...S.btnGhost }}>
                Anuluj
              </button>
              <button onClick={handleConnect} disabled={!formApiKey || connecting} style={{ ...S.btn, ...S.btnPrimary, opacity: (!formApiKey || connecting) ? 0.6 : 1 }}>
                {connecting ? 'Laczenie...' : 'Polacz i importuj →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Connect Shoper */}
      {connectModal === 'shoper' && (
        <div style={S.overlay} onClick={() => setConnectModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={S.modalTitle}>Polacz Shoper</h2>
            {error && <div style={S.error}>{error}</div>}
            <label style={S.label}>Adres sklepu</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="mojsklep"
                value={formShopUrl}
                onChange={e => setFormShopUrl(e.target.value)}
                style={{ ...S.input, flex: 1 }}
                autoFocus
              />
              <span style={{ color: 'rgba(240,240,245,0.5)', fontSize: 14, whiteSpace: 'nowrap' }}>.shoper.pl</span>
            </div>
            <label style={S.label}>Klucz API</label>
            <input
              type="text"
              placeholder="Klucz API Shoper..."
              value={formApiKey}
              onChange={e => setFormApiKey(e.target.value)}
              style={{ ...S.input, marginBottom: 8 }}
            />
            <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', margin: '0 0 24px' }}>
              Shoper Panel → Ustawienia → API
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setConnectModal(null); setFormApiKey(''); setFormShopUrl(''); setError(null); }} style={{ ...S.btn, ...S.btnGhost }}>
                Anuluj
              </button>
              <button onClick={handleConnect} disabled={!formApiKey || !formShopUrl || connecting} style={{ ...S.btn, ...S.btnPrimary, opacity: (!formApiKey || !formShopUrl || connecting) ? 0.6 : 1 }}>
                {connecting ? 'Laczenie...' : 'Polacz i importuj →'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}