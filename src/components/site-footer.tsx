"use client";

import { motion } from "motion/react";
import { useLocale } from "@/contexts/locale-context";

export function SiteFooter() {
  const { locale } = useLocale();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative border-t border-foreground/10 mt-12 py-12 text-center text-sm text-foreground/55"
    >
      <div className="lg:ml-72">
      <div className="max-w-2xl mx-auto px-6 sm:px-8 lg:px-16 space-y-2">
        <p>
          {locale === "ko" ? (
            <>
              만든 사람:{" "}
              <a
                href="https://github.com/jaehafe"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground/80 hover:text-foreground underline-offset-2 hover:underline"
              >
                jaeha
              </a>{" "}
              <span className="text-rose-500" aria-label="love">
                ❤
              </span>{" "}
              한국 사람들이 친구·가족과 화투를 가르칠 때 쓸 수 있도록.
            </>
          ) : (
            <>
              made with{" "}
              <span className="text-rose-500" aria-label="love">
                ❤
              </span>{" "}
              by{" "}
              <a
                href="https://github.com/jaehafe"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground/80 hover:text-foreground underline-offset-2 hover:underline"
              >
                jaeha
              </a>{" "}
              — for Koreans teaching their friends 화투.
            </>
          )}
        </p>
        <p className="text-xs text-foreground/40">
          {locale === "ko"
            ? "비주얼 가이드 — themahjong.guide 에서 영감을 얻었어요."
            : "A visual guide — inspired by themahjong.guide."}
        </p>
      </div>
      </div>
    </motion.footer>
  );
}
