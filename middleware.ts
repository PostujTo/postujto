import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Publiczne ścieżki (bez logowania)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Jeśli to NIE jest publiczna ścieżka, wymaga logowania
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Pomijamy Next.js internals i pliki statyczne
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Zawsze uruchamiaj dla API routes
    '/(api|trpc)(.*)',
  ],
};