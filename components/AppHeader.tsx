'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser, useClerk, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

const PLAN_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  free: { bg: 'rgba(255,255,255,0.08)', text: '#a0a0b0', label: 'FREE' },
  standard: { bg: 'rgba(6,182,212,0.15)', text: '#22d3ee', label: 'STARTER • Unlimited' },
  premium: { bg: 'rgba(99,102,241,0.2)', text: '#a5b4fc', label: 'PRO • Unlimited' },
};

type HeaderProps = {
  activePage: 'generator' | 'calendar' | 'dashboard' | 'settings';
  credits?: { plan: string; remaining: number; total: number } | null;
  onPortalClick?: () => void;
  portalLoading?: boolean;
};

export function AppHeader({ activePage, credits, onPortalClick, portalLoading }: HeaderProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const plan = credits?.plan ?? 'free';
  const planColors = PLAN_COLORS[plan] ?? PLAN_COLORS.free;
  const hasActivePlan = credits && credits.plan !== 'free';

  const navItems = [
    { href: '/app', label: '✨ Generator', key: 'generator' as const },
    { href: '/calendar', label: '📅 Kalendarz', key: 'calendar' as const },
    { href: '/dashboard', label: '📊 Dashboard', key: 'dashboard' as const },
  ];

  return (
    <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="header-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>

        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            Postuj<span className="gradient-text">To</span>
          </span>
        </Link>

        <div className="desktop-nav" style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
          {navItems.map(item => (
            item.key === activePage
              ? <button key={item.key} style={{ padding: '7px 18px', borderRadius: 9, fontSize: 13, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', cursor: 'default', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                  {item.label}
                </button>
              : <Link key={item.key} href={item.href} style={{ textDecoration: 'none' }}>
                  <button className="btn-ghost" style={{ padding: '7px 18px', borderRadius: 9, fontSize: 13, border: 'none', background: 'transparent', color: 'rgba(240,240,245,0.5)' }}>
                    {item.label}
                  </button>
                </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>

          <div className="desktop-credits" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SignedIn>
              {credits && (
                <>
                  <span style={{ padding: '6px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: planColors.bg, color: planColors.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {planColors.label}
                  </span>
                  {credits.plan === 'free' && (
                    <span style={{ padding: '6px 10px', borderRadius: 100, fontSize: 11, background: credits.remaining === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', color: credits.remaining === 0 ? '#f87171' : 'rgba(240,240,245,0.5)' }}>
                      {credits.remaining}/{credits.total} kredytów
                    </span>
                  )}
                  {hasActivePlan && onPortalClick && (
                    <button onClick={onPortalClick} disabled={portalLoading} className="btn-ghost" style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13 }}>
                      {portalLoading ? '...' : 'Subskrypcja'}
                    </button>
                  )}
                </>
              )}
            </SignedIn>
          </div>

          <SignedIn>
            <div className="desktop-avatar" style={{ position: 'relative' }}>
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="Avatar" onClick={() => setAvatarMenuOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', border: '2px solid rgba(99,102,241,0.4)' }} />
                : <div onClick={() => setAvatarMenuOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', border: '2px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
              }
              {avatarMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#16162a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 8, minWidth: 180, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <Link href="/settings" style={{ textDecoration: 'none' }} onClick={() => setAvatarMenuOpen(false)}>
                    <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 14, color: 'rgba(240,240,245,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      🎨 Brand Kit
                    </div>
                  </Link>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                  <button onClick={() => signOut({ redirectUrl: '/' })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, color: 'rgba(240,240,245,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    ↪ Wyloguj
                  </button>
                </div>
              )}
            </div>
          </SignedIn>
          <SignedOut>
            <div className="desktop-signin">
              <SignInButton mode="modal" forceRedirectUrl="/app">
                <button className="btn-secondary" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  Zaloguj się
                </button>
              </SignInButton>
            </div>
          </SignedOut>

          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'rgba(16,16,26,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {navItems.map(item => (
              <Link key={item.key} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: item.key === activePage ? 600 : 400,
                  color: item.key === activePage ? '#a5b4fc' : 'rgba(240,240,245,0.7)',
                  background: item.key === activePage ? 'rgba(99,102,241,0.12)' : 'transparent',
                  border: item.key === activePage ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                }}>
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
          <SignedIn>
            {credits && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ padding: '5px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: planColors.bg, color: planColors.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {planColors.label}
                </span>
                {credits.plan === 'free' && (
                  <span style={{ padding: '5px 10px', borderRadius: 100, fontSize: 11, background: credits.remaining === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', color: credits.remaining === 0 ? '#f87171' : 'rgba(240,240,245,0.5)' }}>
                    {credits.remaining}/{credits.total} kredytów
                  </span>
                )}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Link href="/settings" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 14, color: 'rgba(240,240,245,0.7)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  🎨 Brand Kit
                </div>
              </Link>
              <button onClick={() => signOut({ redirectUrl: '/' })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, color: 'rgba(240,240,245,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left' }}>
                ↪ Wyloguj
              </button>
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/app">
              <button className="btn-secondary" style={{ width: '100%', padding: '12px 20px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                Zaloguj się
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      )}
    </header>
  );
}
