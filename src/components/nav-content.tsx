"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@heroui/react";
import { SECTIONS } from "@/lib/sections";
import { useLocale } from "@/contexts/locale-context";
import { useVariant, VARIANTS } from "@/contexts/variant-context";
import { useTheme } from "@/contexts/theme-context";

export function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { locale, setLocale } = useLocale();
  const { variant, setVariant } = useVariant();
  const { theme, toggleTheme } = useTheme();
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    onNavigate?.();
  };

  return (
    <>
      <div className="flex items-baseline gap-2 text-lg font-semibold tracking-tight">
        <span>Go-Stop</span>
        <span className="text-foreground/50 font-normal text-base">고스톱</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {SECTIONS.map((section) => {
          const isActive = active === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollTo(section.id);
              }}
              className={`flex items-baseline gap-3 py-2 px-3 -mx-3 rounded-md transition-colors ${
                isActive
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              <span className="text-xs tabular-nums opacity-70">{section.num}</span>
              <span className="text-sm leading-snug">
                {locale === "ko" ? section.labelKo : section.label}
              </span>
            </a>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 mt-auto">
        <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">
          {locale === "ko" ? "룰셋" : "Ruleset"}
        </div>
        <div className="flex flex-wrap gap-1">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(v.id)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                variant === v.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-foreground/20 text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {locale === "ko" ? v.labelKo : v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">
          {locale === "ko" ? "언어" : "Language"}
        </div>
        <div className="flex gap-1">
          {(["en", "ko"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                locale === l
                  ? "bg-foreground text-background border-foreground"
                  : "border-foreground/20 text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {l === "en" ? "English" : "한국어"}
            </button>
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
