import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.postujto.com https://*.clerk.accounts.dev https://js.stripe.com https://challenges.cloudflare.com https://code.tidio.co https://*.tidio.co https://*.tidio.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://*.clerk.com https://img.clerk.com https://*.googleusercontent.com https://replicate.delivery https://*.replicate.com https://*.tidio.co https://*.tidio.com",
      "connect-src 'self' https://*.supabase.co https://clerk.postujto.com https://*.clerk.accounts.dev https://api.anthropic.com https://api.replicate.com https://api.stripe.com https://api.resend.com https://*.tidio.co https://*.tidio.com wss://*.tidio.com wss://*.tidio.co",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
      "worker-src 'self' blob:",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  async redirects() {
    const dlaRedirects = [
      // Istniejące (zachowane)
      { from: 'salon-kosmetyczny', to: 'kosmetyczka' },
      { from: 'sklep-spozywczy',   to: 'sklep' },
      { from: 'sklep-odziezowy',   to: 'sklep' },
      { from: 'silownia',          to: 'fitness' },
      { from: 'rekodzielnik',      to: 'rekodzielnictwo' },
      { from: 'rzemioslo',         to: 'rekodzielnictwo' },
      { from: 'it-software',       to: 'uslugi' },
      { from: 'przychodnia',       to: 'stomatolog' },
      // Gastronomia
      { from: 'gastronomia',       to: 'restauracja' },
      { from: 'lokal',             to: 'restauracja' },
      { from: 'bar',               to: 'restauracja' },
      { from: 'meal-prep',         to: 'catering' },
      { from: 'catering-dieta',    to: 'catering' },
      { from: 'dieta',             to: 'catering' },
      { from: 'piekarnia-cukiernia', to: 'piekarnia' },
      { from: 'cukiernia',         to: 'piekarnia' },
      { from: 'market',            to: 'sklep' },
      { from: 'delikatesy',        to: 'sklep' },
      // Uroda i Zdrowie
      { from: 'kosmetologia',      to: 'kosmetyczka' },
      { from: 'uroda',             to: 'kosmetyczka' },
      { from: 'paznokcie',         to: 'kosmetyczka' },
      { from: 'salon-fryzjerski',  to: 'fryzjer' },
      { from: 'fryzjerka',         to: 'fryzjer' },
      { from: 'barber',            to: 'fryzjer' },
      { from: 'barberszop',        to: 'fryzjer' },
      { from: 'sport',             to: 'fitness' },
      { from: 'trener',            to: 'fitness' },
      { from: 'trener-personalny', to: 'fitness' },
      { from: 'zdrowie',           to: 'stomatolog' },
      { from: 'dentysta',          to: 'stomatolog' },
      { from: 'klinika',           to: 'stomatolog' },
      { from: 'petsitter',         to: 'weterynarz' },
      { from: 'zwierzeta',         to: 'weterynarz' },
      { from: 'wet',               to: 'weterynarz' },
      // Handel
      { from: 'sklep-internetowy', to: 'handel' },
      { from: 'e-commerce',        to: 'handel' },
      { from: 'ecommerce',         to: 'handel' },
      { from: 'handmade',          to: 'rekodzielnictwo' },
      { from: 'rzemieslnik',       to: 'rekodzielnictwo' },
      // Usługi i Rzemiosło
      { from: 'remont',            to: 'budowlanka' },
      { from: 'remonty',           to: 'budowlanka' },
      { from: 'budowlany',         to: 'budowlanka' },
      { from: 'wykonczenia',       to: 'budowlanka' },
      { from: 'it',                to: 'uslugi' },
      { from: 'uslugi-it',         to: 'uslugi' },
      { from: 'firma-uslugowa',    to: 'uslugi' },
      { from: 'fotografia',        to: 'fotograf' },
      { from: 'kamerzysta',        to: 'fotograf' },
      { from: 'ogrodnictwo',       to: 'ogrodnik' },
      { from: 'krajobraz',         to: 'ogrodnik' },
      { from: 'logistyka',         to: 'transport' },
      { from: 'przewoz',           to: 'transport' },
      { from: 'spedycja',          to: 'transport' },
      { from: 'kancelaria',        to: 'prawnik' },
      { from: 'adwokat',           to: 'prawnik' },
      { from: 'radca',             to: 'prawnik' },
      // Edukacja
      { from: 'korepetytor',       to: 'korepetycje' },
      { from: 'nauczyciel',        to: 'korepetycje' },
      { from: 'lekcje',            to: 'korepetycje' },
      { from: 'kurs',              to: 'edukacja' },
      { from: 'kursy',             to: 'edukacja' },
      { from: 'szkolenie',         to: 'edukacja' },
      { from: 'szkolenia',         to: 'edukacja' },
      { from: 'akademia',          to: 'edukacja' },
      // Nieruchomości i Turystyka
      { from: 'agent-nieruchomosci', to: 'nieruchomosci' },
      { from: 'posrednictwo',      to: 'nieruchomosci' },
      { from: 'deweloper',         to: 'nieruchomosci' },
      { from: 'hotel',             to: 'turystyka' },
      { from: 'pensjonat',         to: 'turystyka' },
      { from: 'biuro-podrozy',     to: 'turystyka' },
      { from: 'wakacje',           to: 'turystyka' },
      { from: 'agroturystyka',     to: 'turystyka' },
    ];
    return dlaRedirects.map(({ from, to }) => ({
      source: `/dla/${from}`,
      destination: `/dla/${to}`,
      permanent: true,
    }));
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;