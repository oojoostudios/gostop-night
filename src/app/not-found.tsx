'use client';

import Link from 'next/link';
import { Mascot } from '@/components/mascot';
import { useLocale } from '@/contexts/locale-context';

/** Shown for any address the site doesn't have. */
export default function NotFound() {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <Mascot alt="" className="w-32" />
      <div className="font-display text-5xl text-plum">404</div>
      <p className="text-lg text-ink">
        {ko ? '페이지를 찾을 수 없어요.' : 'This page could not be found.'}
      </p>
      <Link href="/gostop" className="club-btn club-btn--primary px-6 py-2.5">
        {ko ? '가이드로 돌아가기' : 'Back to the guide'}
      </Link>
    </main>
  );
}
