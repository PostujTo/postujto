'use client';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { BottomNavBar } from './BottomNavBar';

const APP_ROUTES_WITH_BOTTOM_NAV = ['/app', '/calendar', '/dashboard', '/settings', '/audit'];

export function BottomNavBarConditional() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  if (!isLoaded) return null;

  const showBottomNav = user && APP_ROUTES_WITH_BOTTOM_NAV.some(route => pathname.startsWith(route));
  if (!showBottomNav) return null;

  return <BottomNavBar />;
}
