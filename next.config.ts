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
      { from: 'salon-kosmetyczny', to: 'kosmetyczka' },
      { from: 'sklep-spozywczy',   to: 'sklep' },
      { from: 'sklep-odziezowy',   to: 'sklep' },
      { from: 'silownia',          to: 'fitness' },
      { from: 'rekodzielnik',      to: 'rekodzielnictwo' },
      { from: 'rzemioslo',         to: 'rekodzielnictwo' },
      { from: 'it-software',       to: 'uslugi' },
      { from: 'przychodnia',       to: 'stomatolog' },
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