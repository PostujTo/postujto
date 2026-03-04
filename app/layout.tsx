import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import { CookieBanner } from '@/components/CookieBanner';

const lato = Lato({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
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
        <body className={lato.className}>
  {children}
  <CookieBanner />
</body>
      </html>
    </ClerkProvider>
  );
}