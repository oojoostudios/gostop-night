'use client';

import { motion } from 'motion/react';
import { useLocale } from '@/contexts/locale-context';

export function SiteFooter() {
  const { locale } = useLocale();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative border-t border-hairline mt-12 py-12 text-center text-body text-ink-soft"
    >
      <div className="lg:ml-72">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 lg:px-16 space-y-2">
          <p>
            {locale === 'ko'
              ? '고스톱 클럽 — 우리 고스톱 게임 나이트를 위한 가이드.'
              : 'GoStop Club — a guide for our Go-Stop game nights.'}
          </p>
          <p className="text-label text-ink-soft">
            {locale === 'ko' ? (
              <>
                <a
                  href="https://gostopguide.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:text-ink hover:underline"
                >
                  gostopguide.com
                </a>{' '}
                by jaeha (MIT) 기반
              </>
            ) : (
              <>
                Based on{' '}
                <a
                  href="https://gostopguide.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:text-ink hover:underline"
                >
                  gostopguide.com
                </a>{' '}
                by jaeha (MIT)
              </>
            )}
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
