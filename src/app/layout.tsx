import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { Providers } from './providers';
import { SiteHeader } from '@/components/site-header';
import Footer from '@/components/ui/footer';
import './globals.css';

// Brand type: Fraunces for headlines + logotype, Inter for UI/body.
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cenit — Premium Event Planning',
  description: 'Find venues, create shared gifts, and collect contributions for unforgettable celebrations.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--ink-1)] antialiased">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
