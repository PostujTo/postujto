'use client';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

const APP_ROUTES_WITH_BOTTOM_NAV = ['/app', '/calendar', '/dashboard', '/settings', '/audit'];

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  const hasBottomNav = isLoaded && !!user &&
    APP_ROUTES_WITH_BOTTOM_NAV.some(r => pathname.startsWith(r));

  return (
    <main
      style={{ paddingTop: '64px' }}
      className={`main-content${hasBottomNav ? ' has-bottom-nav' : ''}`}
    >
      {children}
    </main>
  );
}
