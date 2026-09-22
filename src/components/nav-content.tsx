'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@heroui/react';
import { SECTIONS_BY_GAME } from '@/lib/sections';
import { getActiveGame } from '@/lib/games';
import { useLocale } from '@/contexts/locale-context';
import { useTheme } from '@/contexts/theme-context';
import { BrandBlock } from '@/components/brand-block';

export function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const game = getActiveGame(pathname);
  const sections = SECTIONS_BY_GAME[game];
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
    // Jump instead of gliding for visitors who asked their device for less motion.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    onNavigate?.();
  };

  return (
    <>
      <BrandBlock className="w-36" />

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
              <span className="relative z-10 text-label tabular-nums">{section.num}</span>
              <span className="relative z-10 text-label leading-snug">
                {locale === 'ko' ? section.labelKo : section.label}
              </span>
            </a>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2">
        <div className="text-label uppercase tracking-[0.18em] text-ink-soft">
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
        className="justify-start gap-2 text-label"
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
