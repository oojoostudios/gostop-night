"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@heroui/react";
import { SECTIONS_BY_GAME } from "@/lib/sections";
import { getActiveGame } from "@/lib/games";
import { useLocale } from "@/contexts/locale-context";
import { useVariant, VARIANTS } from "@/contexts/variant-context";
import { useTheme } from "@/contexts/theme-context";

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
      { rootMargin: "-35% 0px -55% 0px" },
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
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    onNavigate?.();
  };

  return (
    <>
      <BrandBlock locale={locale} />

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
              className={`relative flex items-baseline gap-3 py-2 px-3 -mx-3 rounded-md transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={`sidebar-active-${game}`}
                  className="absolute inset-0 rounded-md bg-foreground/10"
                  transition={{
                    type: "spring",
                    stiffness: 480,
                    damping: 32,
                    mass: 0.7,
                  }}
                />
              )}
              <span className="relative z-10 text-xs tabular-nums opacity-70">
                {section.num}
              </span>
              <span className="relative z-10 text-sm leading-snug">
                {locale === "ko" ? section.labelKo : section.label}
              </span>
            </a>
          );
        })}
      </nav>

      {game === "gostop" && visibleVariants.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">
            {locale === "ko" ? "룰셋" : "Ruleset"}
          </div>
          <div className="flex flex-wrap gap-1">
            {visibleVariants.map((v) => (
              <motion.button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                whileTap={{ scale: 0.93 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 0.6,
                }}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  variant === v.id
                    ? "bg-[var(--mat)] text-white border-[var(--mat)]"
                    : "border-foreground/20 text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {locale === "ko" ? v.labelKo : v.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">
          {locale === "ko" ? "언어" : "Language"}
        </div>
        <div className="flex gap-1">
          {(["en", "ko"] as const).map((l) => (
            <motion.button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              whileTap={{ scale: 0.93 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.6,
              }}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                locale === l
                  ? "bg-[var(--felt)] text-white border-[var(--felt)]"
                  : "border-foreground/20 text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {l === "en" ? "English" : "한국어"}
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
        {theme === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
        {locale === "ko"
          ? theme === "dark"
            ? "밝게"
            : "어둡게"
          : theme === "dark"
            ? "Light"
            : "Dark"}
      </Button>
    </>
  );
}

/**
 * Brand block — replaces the previous 2-column GameTabs since yutnori is
 * still WIP. Shows the GAME name (고스톱 / Go-Stop) in both scripts.
 *
 * Why no `花鬪` here: hwatu (花鬪) is the CARDS, not the game. Mixing the
 * two as a brand mark — `Go-Stop / 花鬪` — reads as if they're the same
 * thing. Hero handles the cards-game relationship explicitly with a
 * tagline; the sidebar only needs the game's name.
 */
function BrandBlock({ locale }: { locale: "ko" | "en" }) {
  return (
    <Link href="/gostop" className="group block">
      <div className="text-xl font-semibold tracking-tight leading-tight text-foreground group-hover:text-foreground transition-colors">
        {locale === "ko" ? "고스톱" : "Go-Stop"}
      </div>
      {/* Same game in the other script — like Mahjong's English/中文 pair. */}
      <div
        className="text-base text-foreground/55 leading-tight mt-0.5"
        style={{ fontFamily: "var(--font-accent)" }}
      >
        {locale === "ko" ? "Go-Stop" : "고스톱"}
      </div>
    </Link>
  );
}
