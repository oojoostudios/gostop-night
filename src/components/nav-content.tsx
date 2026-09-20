'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@heroui/react';
import { SECTIONS_BY_GAME } from '@/lib/sections';
import { getActiveGame } from '@/lib/games';
import { useLocale } from '@/contexts/locale-context';
import { useVariant, VARIANTS } from '@/contexts/variant-context';
import { useTheme } from '@/contexts/theme-context';
import { Mascot } from '@/components/mascot';
import { Wordmark } from '@/components/wordmark';

export function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { locale, setLocale } = useLocale();
  const { variant, setVariant } = useVariant();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const game = getActiveGame(pathname);
  const sections = SECTIONS_BY_GAME[game];
  const visibleVariants = VARIANTS.filter((v) => !v.disabled);
  const [active, setActive] = useState<string>(sections[0].id);

  // Reset active section when switching games.
  useEffect(() => {
    setActive(sections[0].id);
  }, [game, sections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    // Defer to ensure the new page's sections are mounted.
    const raf = requestAnimationFrame(() => {
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) observer.observe(el);
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [sections]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onNavigate?.();
  };

  return (
    <>
      <BrandBlock />

      <nav className="flex flex-col gap-0.5">
        {sections.map((section) => {
          const isActive = active === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollTo(section.id);
              }}
              className={`relative flex items-baseline gap-3 py-2 px-3 -mx-3 rounded-full transition-colors ${
                isActive ? 'text-surface' : 'text-ink-soft hover:text-ink hover:bg-surface'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={`sidebar-active-${game}`}
                  className="absolute inset-0 rounded-full bg-plum"
                  transition={{
                    type: 'spring',
                    stiffness: 480,
                    damping: 32,
                    mass: 0.7,
                  }}
                />
              )}
              <span className="relative z-10 text-xs tabular-nums">{section.num}</span>
              <span className="relative z-10 text-sm leading-snug">
                {locale === 'ko' ? section.labelKo : section.label}
              </span>
            </a>
          );
        })}
      </nav>

      {game === 'gostop' && visibleVariants.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">
            {locale === 'ko' ? '룰셋' : 'Ruleset'}
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleVariants.map((v) => (
              <motion.button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                aria-pressed={variant === v.id}
                whileTap={{ scale: 0.93 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                  mass: 0.6,
                }}
                className="club-chip"
              >
                {locale === 'ko' ? v.labelKo : v.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">
          {locale === 'ko' ? '언어' : 'Language'}
        </div>
        <div className="flex gap-2">
          {(['en', 'ko'] as const).map((l) => (
            <motion.button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              aria-pressed={locale === l}
              whileTap={{ scale: 0.93 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.6,
              }}
              className="club-chip"
            >
              {l === 'en' ? 'English' : '한국어'}
            </motion.button>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onPress={toggleTheme}
        className="justify-start gap-2 text-xs"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        {locale === 'ko'
          ? theme === 'dark'
            ? '밝게'
            : '어둡게'
          : theme === 'dark'
            ? 'Light'
            : 'Dark'}
      </Button>
    </>
  );
}

/** Brand block: the mascot and the Club Go Stop wordmark, linking home. */
function BrandBlock() {
  return (
    <Link href="/gostop" className="flex items-center gap-3">
      <Mascot size="sm" className="w-14" />
      <Wordmark size="sm" />
    </Link>
  );
}
