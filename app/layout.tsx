import { ClerkProvider } from '@clerk/nextjs';
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
  title: 'PostujTo.pl - Generator postów AI',
  description: 'Generuj profesjonalne posty dla Facebook i Instagram w sekundę',
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
        </body>
      </html>
    </ClerkProvider>
  );
}