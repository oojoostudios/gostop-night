import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/providers';
import { ScrollProgress } from '@/components/scroll-progress';
import { bodyFont, displayKoreanFont, displayLatinFont } from '@/lib/fonts';

// Set NEXT_PUBLIC_SITE_URL to override this (e.g. a custom domain later).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gostop-night.vercel.app';
const SITE_NAME = 'GoStop Club · 고스톱 클럽';
const SITE_DESCRIPTION =
  'A phone-first Go-Stop guide for our game nights: learn the rules in five minutes. 고스톱 게임 나이트를 위한 모바일 가이드, 5분이면 룰을 익혀요.';
const OG_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: '%s · GoStop Club',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['GoStop Club', '고스톱 클럽', 'go-stop', '고스톱', '화투', 'hwatu', 'game night'],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
    alternateLocale: 'ko_KR',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayLatinFont.variable} ${displayKoreanFont.variable} ${bodyFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('gostop:theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`}
        </Script>
        <Providers>
          <ScrollProgress />
          {children}
        </Providers>
      </body>
    </html>
  );
}
