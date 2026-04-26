"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@heroui/react";
import { useLocale } from "@/contexts/locale-context";
import { resolveThrow, type ThrowKind } from "@/lib/yutnori";
import { playResult, playThrow, unlockAudio } from "@/lib/sound";
import {
  YutThrowScene,
  type YutThrowSceneApi,
} from "@/components/yut-throw-scene";

export function YutThrowSimulator() {
  const { locale } = useLocale();
  const [result, setResult] = useState<ThrowKind | null>(null);
  const [throwing, setThrowing] = useState(false);
  const [hasThrown, setHasThrown] = useState(false);
  const sceneRef = useRef<YutThrowSceneApi>(null);

  const onThrow = () => {
    unlockAudio();
    playThrow();
    setThrowing(true);
    setResult(null);
    setHasThrown(true);
    sceneRef.current?.throwSticks();
  };

  const onResult = (flats: boolean[]) => {
    setResult(resolveThrow(flats));
    setThrowing(false);
    playResult();
  };

  const onReset = () => {
    sceneRef.current?.reset();
    setResult(null);
    setHasThrown(false);
  };

  return (
    <div className="rounded-xl border border-foreground/15 bg-foreground/[0.02] overflow-hidden">
      <div className="px-6 pt-6 pb-2 flex items-baseline justify-between">
        <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50">
          {locale === "ko" ? "직접 던져보기" : "Try a throw"}
        </div>
        <div className="text-[10px] text-foreground/40 italic">
          {locale === "ko" ? "진짜 3D 물리" : "Real 3D physics"}
        </div>
      </div>

      <div className="relative h-[300px] sm:h-[360px] lg:h-[420px] bg-[#1c1614]">
        <YutThrowScene ref={sceneRef} onResult={onResult} />
      </div>

      <div className="flex flex-col items-center gap-4 p-6">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onPress={onThrow}
            isDisabled={throwing}
            className="gap-2"
          >
            <Sparkles className={`size-4 ${throwing ? "animate-spin" : ""}`} />
            {throwing
              ? locale === "ko"
                ? "굴러가는 중…"
                : "Tumbling…"
              : hasThrown
                ? locale === "ko"
                  ? "다시 던지기"
                  : "Throw again"
                : locale === "ko"
                  ? "윷 던지기"
                  : "Throw the sticks"}
          </Button>
          {hasThrown && !throwing && (
            <Button
              variant="ghost"
              size="md"
              onPress={onReset}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="size-3.5" />
              {locale === "ko" ? "정리" : "Reset"}
            </Button>
          )}
        </div>

        <div className="min-h-8">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={`result-${Math.random()}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-baseline gap-3"
              >
                <span className="text-3xl font-semibold tracking-tight">
                  {locale === "ko" ? result.nameKo : result.nameEn}
                </span>
                <span className="text-base text-foreground/60 tabular-nums">
                  {result.move > 0 ? `+${result.move}` : result.move}
                  {locale === "ko" ? "칸" : ""}
                </span>
                {result.extraThrow && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    {locale === "ko" ? "한 번 더!" : "extra throw!"}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
