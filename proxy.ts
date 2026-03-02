import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/settings(.*)',
]);

// Prosta mapa rate limitingu w pamięci
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/generate': { max: 10, windowMs: 60 * 1000 },      // 10 req/min
  '/api/image': { max: 5, windowMs: 60 * 1000 },           // 5 req/min
  '/api/brand-kit': { max: 20, windowMs: 60 * 1000 },      // 20 req/min
  '/api/dashboard': { max: 30, windowMs: 60 * 1000 },      // 30 req/min
};

function checkRateLimit(ip: string, path: string): boolean {
  const limit = Object.entries(RATE_LIMITS).find(([route]) => path.startsWith(route));
  if (!limit) return true;

  const [route, { max, windowMs }] = limit;
  const key = `${ip}:${route}`;
  const now = Date.now();
  const record = rateLimit.get(key);

  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= max) return false;

  record.count++;
  return true;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('x-real-ip') || 
             'unknown';
  const path = req.nextUrl.pathname;

  if (path.startsWith('/api/') && !checkRateLimit(ip, path)) {
    return NextResponse.json(
      { error: 'Zbyt wiele zapytań. Spróbuj za chwilę.' },
      { status: 429 }
    );
  }

  // Ochrona tras wymagających logowania
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};