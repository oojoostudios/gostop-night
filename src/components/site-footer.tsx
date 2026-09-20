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
      className="relative border-t border-hairline mt-12 py-12 text-center text-sm text-ink-soft"
    >
      <div className="lg:ml-72">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 lg:px-16 space-y-2">
          <p>
            {locale === 'ko'
              ? '처음 화투를 잡아보는 분을 위한 비주얼 가이드.'
              : 'A visual guide to Korean go-stop, for first-time players.'}
          </p>
          <p className="text-xs text-ink-soft">
            {locale === 'ko' ? '만든 사람 ' : 'Built by '}
            <a
              href="https://github.com/jaehafe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-soft hover:text-ink underline-offset-2 hover:underline"
            >
              jaeha
            </a>
            <span className="mx-1.5 text-ink-soft">·</span>
            <a
              href="https://github.com/k-culture-play/gostop-guide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-soft hover:text-ink underline-offset-2 hover:underline"
            >
              {locale === 'ko' ? '소스' : 'Source'}
            </a>
            <span className="mx-1.5 text-ink-soft">·</span>
            <a
              href="https://x.com/miniapp223"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-soft hover:text-ink underline-offset-2 hover:underline"
            >
              @miniapp223
            </a>
            <span className="mx-1.5 text-ink-soft">·</span>
            {locale === 'ko' ? (
              <>
                <a
                  href="https://themahjong.guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-soft hover:text-ink underline-offset-2 hover:underline"
                >
                  themahjong.guide
                </a>
                {' 에서 영감'}
              </>
            ) : (
              <>
                {'inspired by '}
                <a
                  href="https://themahjong.guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-soft hover:text-ink underline-offset-2 hover:underline"
                >
                  themahjong.guide
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
