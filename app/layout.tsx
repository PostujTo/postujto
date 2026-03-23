import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import './globals.css';
import type { Metadata } from 'next';
import { Poppins, DM_Sans } from 'next/font/google';
import { CookieBanner } from '@/components/CookieBanner';

const poppins = Poppins({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const dmSans = DM_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PostujTo — Autopilot Marketingowy dla Polskich Firm',
  description: 'Twój profil na FB, IG i TikTok zawsze aktywny. 30 postów w 5 minut, bez agencji, bez stresu. Zacznij za darmo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pl">
        <body className={`${poppins.variable} ${dmSans.variable}`}>
          {children}
          <CookieBanner />
          <Script src="//code.tidio.co/n72cgknm7wuvvfcfhz0dglu7gwkcef2n.js" strategy="afterInteractive" />
        </body>
      </html>
    </ClerkProvider>
  );
}