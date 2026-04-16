'use client';
import Link from 'next/link';
import { useUser, useClerk, SignInButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const MINIMAL_NAV_ROUTES = [
  '/sign-in', '/sign-up', '/onboarding', '/success', '/cancel',
  '/terms', '/privacy', '/status',
];
const PLAN_LABELS: Record<string, string> = { free: 'FREE', standard: 'STARTER', premium: 'PRO' };
const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  free:     { bg: 'rgba(255,255,255,0.08)', text: '#a0a0b0' },
  standard: { bg: 'rgba(6,182,212,0.15)',   text: '#22d3ee' },
  premium:  { bg: 'rgba(99,102,241,0.2)',   text: '#a5b4fc' },
};

export function TopAppBar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [credits, setCredits] = useState<{ plan: string; remaining: number; total: number } | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  const isMinimal = MINIMAL_NAV_ROUTES.some(r => pathname.startsWith(r));
  const logoHref = user ? '/app' : '/';

  useEffect(() => {
    if (!user) { setCredits(null); return; }
    fetch('/api/credits')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setCredits(data); })
      .catch(() => {});
  }, [user, pathname]);

  const plan = credits?.plan ?? 'free';
  const planLabel = PLAN_LABELS[plan] ?? plan.toUpperCase();
  const planColors = PLAN_COLORS[plan] ?? PLAN_COLORS.free;
  const hasActivePlan = plan !== 'free';

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/customer-portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { console.error(e); }
    finally { setPortalLoading(false); }
  };

  return (
    <>
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: '64px', display: 'flex', alignItems: 'center',
      padding: '0 24px',
      backgroundColor: 'rgba(10,10,15,0.92)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)', boxSizing: 'border-box',
    }}>

      <Link href={logoHref} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span className="font-display" style={{ fontWeight: 800, fontSize: '20px', color: '#fff', letterSpacing: '-0.02em' }}>
          Postuj<span className="gradient-text">To</span>
        </span>
      </Link>

      {!isMinimal && (
        <nav className="desktop-nav" style={{ alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
          {isLoaded && user ? (
            <>
              <NavLink href="/app" pathname={pathname}>Generator</NavLink>
              <NavLink href="/calendar" pathname={pathname}>Kalendarz</NavLink>
              <NavLink href="/shop" pathname={pathname}>Sklep</NavLink>
              <NavLink href="/dashboard" pathname={pathname}>Dashboard</NavLink>
              <NavLink href="/settings" pathname={pathname}>Ustawienia</NavLink>
            </>
          ) : isLoaded ? (
            <>
              <NavLink href="/pricing" pathname={pathname}>Cennik</NavLink>
              <NavLink href="/faq" pathname={pathname}>FAQ</NavLink>
              <SignInButton mode="modal">
                <button style={{
                  color: 'rgba(255,255,255,0.65)', fontWeight: 400, fontSize: '14px',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px',
                  transition: 'all 0.15s ease', whiteSpace: 'nowrap', fontFamily: 'inherit',
                }}>Zaloguj</button>
              </SignInButton>
              <Link href="/app" style={{
                backgroundColor: '#6C47FF', color: '#fff', padding: '8px 18px',
                borderRadius: '20px', fontWeight: 600, fontSize: '14px',
                textDecoration: 'none', marginLeft: '8px', whiteSpace: 'nowrap',
              }}>Otwórz generator →</Link>
            </>
          ) : null}
        </nav>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {!isMinimal && isLoaded && user && credits && (
          <>
            <span className="desktop-only" style={{
              padding: '5px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
              background: planColors.bg, color: planColors.text,
              textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
            }}>{planLabel}</span>

            {!hasActivePlan && (
              <span className="desktop-only" style={{
                padding: '5px 10px', borderRadius: 100, fontSize: 11,
                background: credits.remaining === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                color: credits.remaining === 0 ? '#f87171' : 'rgba(240,240,245,0.5)', whiteSpace: 'nowrap',
              }}>{credits.remaining}/{credits.total} kredytów</span>
            )}

            {hasActivePlan && (
              <button onClick={handlePortal} disabled={portalLoading} className="desktop-only" style={{
                padding: '7px 14px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(240,240,245,0.7)', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>{portalLoading ? '...' : 'Subskrypcja'}</button>
            )}
          </>
        )}

        {isLoaded && user && (
          <div style={{ position: 'relative' }}>
            {user.imageUrl
              ? <img src={user.imageUrl} alt="Avatar" onClick={() => setAvatarOpen(o => !o)}
                  style={{ width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', border: '2px solid rgba(99,102,241,0.4)', display: 'block' }} />
              : <div onClick={() => setAvatarOpen(o => !o)} style={{
                  width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                  border: '2px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>👤</div>
            }
            {avatarOpen && (
              <>
                <div onClick={() => setAvatarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8, zIndex: 1001,
                  background: '#16162a', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: 8, minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}>
                  {credits && (
                    <div style={{ padding: '8px 14px 6px', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, background: planColors.bg, color: planColors.text, padding: '3px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{planLabel}</span>
                      {!hasActivePlan && <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(240,240,245,0.4)' }}>{credits.remaining}/{credits.total} kr.</span>}
                    </div>
                  )}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                  <Link href="/settings" onClick={() => setAvatarOpen(false)} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 14, color: 'rgba(240,240,245,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      🎨 Brand Kit i ustawienia
                    </div>
                  </Link>
                  {hasActivePlan && (
                    <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 14, color: 'rgba(240,240,245,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                      onClick={() => { setAvatarOpen(false); handlePortal(); }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      💳 Zarządzaj subskrypcją
                    </div>
                  )}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                  <button onClick={() => signOut({ redirectUrl: '/' })} style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
                    color: 'rgba(240,240,245,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    gap: 10, background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    ↪ Wyloguj
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {!isMinimal && isLoaded && !user && (
          <button
            className="mobile-only"
            onClick={() => setHamburgerOpen(o => !o)}
            aria-label="Menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#fff', padding: '4px 8px', lineHeight: 1 }}
          >
            {hamburgerOpen ? '✕' : '☰'}
          </button>
        )}
      </div>
    </header>
    {hamburgerOpen && !isMinimal && !user && (
      <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 999, background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link href="/pricing" onClick={() => setHamburgerOpen(false)} style={{ fontSize: 16, color: 'rgba(240,240,245,0.8)', textDecoration: 'none', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'block' }}>Cennik</Link>
        <Link href="/faq" onClick={() => setHamburgerOpen(false)} style={{ fontSize: 16, color: 'rgba(240,240,245,0.8)', textDecoration: 'none', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'block' }}>FAQ</Link>
        <SignInButton mode="modal">
          <button onClick={() => setHamburgerOpen(false)} style={{ fontSize: 16, color: 'rgba(240,240,245,0.8)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', width: '100%', fontFamily: 'inherit' }}>Zaloguj się</button>
        </SignInButton>
        <Link href="/app" onClick={() => setHamburgerOpen(false)} style={{ display: 'block', marginTop: 12 }}>
          <button style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none', color: '#fff', fontWeight: 700, fontFamily: 'inherit' }}>Otwórz generator →</button>
        </Link>
      </div>
    )}
    </>
  );
}

function NavLink({ href, pathname, children }: { href: string; pathname: string; children: React.ReactNode }) {
  const isActive = pathname === href || (pathname.startsWith(href + '/') && href !== '/');
  return (
    <Link href={href} style={{
      color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.65)',
      fontWeight: isActive ? 600 : 400,
      fontSize: '14px', textDecoration: 'none',
      padding: '6px 12px', borderRadius: '8px',
      backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
      transition: 'all 0.15s ease', whiteSpace: 'nowrap',
    }}>{children}</Link>
  );
}
