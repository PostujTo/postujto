'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/app',       icon: '✨', label: 'Generator' },
  { href: '/calendar',  icon: '📅', label: 'Kalendarz'  },
  { href: '/dashboard', icon: '📊', label: 'Posty'  },
  { href: '/settings',  icon: '⚙️', label: 'Ustawienia' },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="mobile-only bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      height: '80px',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      backgroundColor: '#0f0f1a',
      borderTop: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      boxSizing: 'border-box',
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '3px', padding: '8px 4px',
            borderRadius: '12px', textDecoration: 'none',
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            backgroundColor: 'transparent',
            transition: 'all 0.15s ease', flex: 1, maxWidth: '80px',
          }}>
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
