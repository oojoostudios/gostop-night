"use client";

import { Plus } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";
import { YutStick } from "@/components/yut-stick";
import { YutThrowSimulator } from "@/components/yut-throw-simulator";
import { THROWS, type ThrowKind } from "@/lib/yutnori";

export function SectionYutSticks() {
  const { locale } = useLocale();

  return (
    <section
      id="yut-sticks"
      className="min-h-screen flex flex-col justify-center py-24"
    >
      <div className="text-xs tabular-nums text-foreground/50 mb-4">
        SECTION 01
      </div>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
        {locale === "ko" ? "윷이란?" : "What are yut sticks?"}
      </h2>
      <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-12">
        {locale === "ko"
          ? "한 면은 둥글고 반대 면은 평평한 막대 4개. 던져서 평평한 면이 몇 개 나오는지로 이동 거리가 정해져요."
          : "Four wooden sticks, each round on one side and flat on the other. Toss them — the count of flat-sides facing up tells you how far to move."}
      </p>

      <Anatomy />
      <ThrowsCatalog />
      <YutThrowSimulator />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Anatomy — one stick from both sides                                        */
/* -------------------------------------------------------------------------- */

function Anatomy() {
  const { locale } = useLocale();
  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8 mb-12">
      <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-4">
        {locale === "ko" ? "막대 한 개 — 양면" : "One stick · two sides"}
      </div>
      <div className="grid grid-cols-2 gap-8 max-w-md">
        <div className="flex flex-col items-center gap-3">
          <YutStick flatUp />
          <div className="text-center">
            <div className="font-semibold tracking-tight">
              {locale === "ko" ? "등 (평평한 면)" : "Flat side"}
            </div>
            <div className="text-xs text-foreground/55 mt-0.5">
              {locale === "ko" ? "위로 향하면 카운트" : "Counts when facing up"}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <YutStick flatUp={false} />
          <div className="text-center">
            <div className="font-semibold tracking-tight">
              {locale === "ko" ? "배 (둥근 면)" : "Round side"}
            </div>
            <div className="text-xs text-foreground/55 mt-0.5">
              {locale === "ko" ? "기본적으로 무거워서 잘 떨어짐" : "Heavier — tends to land down"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Catalog of all 6 outcomes                                                  */
/* -------------------------------------------------------------------------- */

function ThrowsCatalog() {
  const { locale } = useLocale();
  return (
    <div className="mb-14">
      <h3 className="text-sm uppercase tracking-[0.18em] font-semibold text-foreground/70 mb-5">
        {locale === "ko" ? "6가지 결과" : "Six possible outcomes"}
      </h3>
      <div className="space-y-2">
        {THROWS.map((t) => (
          <ThrowRow key={t.id} throwKind={t} />
        ))}
      </div>
      <p className="text-xs text-foreground/50 mt-4 italic">
        {locale === "ko"
          ? "* 백도는 선택 룰이에요. 표식 있는 막대(빨간 점)만 평평한 면이 위면 발동."
          : "* Baekdo is an optional rule, triggered only when the marked stick (red dot) is the lone flat-side up."}
      </p>
    </div>
  );
}

function ThrowRow({ throwKind }: { throwKind: ThrowKind }) {
  const { locale } = useLocale();
  const moveLabel =
    throwKind.move > 0
      ? locale === "ko"
        ? `${throwKind.move}칸 앞으로`
        : `+${throwKind.move} forward`
      : locale === "ko"
        ? `${Math.abs(throwKind.move)}칸 뒤로`
        : `${throwKind.move} (back)`;

  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] gap-4 items-center rounded-lg border p-4 ${
        throwKind.isBaekdo
          ? "border-rose-500/30 bg-rose-500/[0.03]"
          : throwKind.extraThrow
            ? "border-amber-500/30 bg-amber-500/[0.03]"
            : "border-foreground/10"
      }`}
    >
      <div className="flex gap-1.5 items-end">
        {throwKind.sticks.map((flat, i) => (
          <YutStick
            key={i}
            flatUp={flat}
            marked={throwKind.markedStickIndex === i}
            size="sm"
          />
        ))}
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold tracking-tight">
            {locale === "ko" ? throwKind.nameKo : throwKind.nameEn}
          </span>
          <span className="text-xs text-foreground/45">
            {locale === "ko" ? throwKind.nameEn : throwKind.nameKo}
          </span>
          {throwKind.extraThrow && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <Plus className="size-2.5" />
              {locale === "ko" ? "한 번 더" : "extra throw"}
            </span>
          )}
          {throwKind.isBaekdo && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
              {locale === "ko" ? "선택 룰" : "variant"}
            </span>
          )}
        </div>
        <p className="text-xs text-foreground/60 mt-1 leading-snug">
          {locale === "ko" ? throwKind.descKo : throwKind.desc}
        </p>
      </div>

      <div className="text-right">
        <div className="text-2xl font-semibold tabular-nums">
          {throwKind.move > 0 ? `+${throwKind.move}` : throwKind.move}
        </div>
        <div className="text-[10px] text-foreground/50 mt-0.5">
          {moveLabel}
        </div>
      </div>
    </div>
  );
}
