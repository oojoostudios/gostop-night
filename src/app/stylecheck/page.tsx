import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { HWATU_DECK } from '@/lib/hwatu';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { CardCaption } from '@/components/card-caption';
import { ColorSwatches, FilterRow, ScreenshotReady, ThemeControls } from './parts';

// Internal design QA page. Not linked from the site, not for guests.
// Everything here is drawn with the tokens in globals.css, so it shows exactly
// what the rest of the site will look like once the design system is applied.
// The mascot lives on /brandcheck.
export const metadata: Metadata = {
  title: 'Style check',
  robots: { index: false, follow: false },
};

/** Section title with its number: same size as the title, Fraunces, in plum. */
function Section({
  n,
  title,
  note,
  children,
}: {
  n: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-display text-3xl leading-tight">
          <span className="text-plum">{n}</span>
          <span className="ml-4">{title}</span>
        </h2>
        {note && <p className="max-w-[62ch] text-ink-soft leading-relaxed">{note}</p>}
      </div>
      {children}
    </section>
  );
}

const Label = ({ children }: { children: ReactNode }) => (
  <div className="text-xs uppercase tracking-wider text-ink-soft mb-3">{children}</div>
);

const GRAIN_SAMPLES = [
  { label: '0%', note: 'flat paper', strength: 0 },
  { label: '5%', note: 'planned', strength: 0.05 },
  { label: '10%', note: 'for comparison', strength: 0.1 },
] as const;

export default function StyleCheckPage() {
  const card = HWATU_DECK.find((c) => c.id === '03-tti')!;

  return (
    <main className="min-h-screen bg-paper text-ink px-5 sm:px-10 py-14">
      <ScreenshotReady />
      <div className="mx-auto max-w-5xl space-y-28">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="space-y-6">
          <h1 className="font-display text-5xl leading-tight">
            Style check <span className="text-ink-soft">· 스타일 체크</span>
          </h1>
          <p className="max-w-[62ch] text-ink-soft leading-relaxed">
            Internal QA page, not linked from the site. Every piece below is built from the tokens
            in <code className="font-mono text-sm">globals.css</code> and the fonts in{' '}
            <code className="font-mono text-sm">fonts.ts</code>. The mascot is on{' '}
            <code className="font-mono text-sm">/brandcheck</code>. 이 페이지는 디자인 토큰
            확인용이에요.
          </p>
          <ThemeControls />
        </header>

        {/* ── 1. Colors ──────────────────────────────────────────────────── */}
        <Section
          n="01"
          title="Color tokens"
          note="Each token with its live hex and the contrast checks that matter for it. Gold, sage and sky are fills, dots and icons only, never text. Ratios are measured in the browser, so they follow the theme."
        >
          <ColorSwatches />
        </Section>

        {/* ── 2. Type ────────────────────────────────────────────────────── */}
        <Section
          n="02"
          title="Type scale"
          note="Fraunces 600 for Latin and Gowun Batang Bold for Korean, both serifs with fine strokes. IBM Plex Sans KR for everything else. No italics, and no heavy rounded display font."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="club-card p-8 space-y-8">
              <Label>Display · Fraunces 600 + Gowun Batang Bold</Label>
              <div className="space-y-2">
                <div className="text-xs text-ink-soft">
                  48px on phones, 60px above · wordmark, in plum
                </div>
                <div className="font-display text-5xl sm:text-6xl leading-none text-plum">
                  Club Go Stop
                </div>
                <div className="font-display text-5xl sm:text-6xl leading-tight text-plum">
                  클럽 고스톱
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-ink-soft">
                  36px · a single big score (see the note under Body and UI)
                </div>
                <div className="font-display text-4xl tabular-nums">
                  Score 152 <span className="text-ink-soft">· 점수 152</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-ink-soft">
                  30px · section title, number in plum at the same size
                </div>
                <div className="font-display text-3xl">
                  <span className="text-plum">01</span>
                  <span className="ml-4">The Hwatu Deck</span>
                </div>
                <div className="font-display text-3xl">
                  <span className="text-plum">01</span>
                  <span className="ml-4">화투 덱</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-ink-soft">
                  Optical size: 144 (used, finest strokes) against 14 (the font&apos;s default)
                </div>
                <div className="font-display text-5xl leading-tight">Tonight</div>
                <div
                  className="font-display text-5xl leading-tight"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  Tonight
                </div>
              </div>
            </div>

            <div className="club-card p-8 space-y-8">
              <Label>Body and UI · IBM Plex Sans KR</Label>
              <div className="space-y-2">
                <div className="text-xs text-ink-soft">16px · 400 regular · rules text</div>
                <p className="text-base leading-relaxed max-w-[62ch]">
                  Match a card from your hand with one on the floor to take both. Three Brights in a
                  row is worth three points.
                </p>
                <p className="text-base leading-relaxed max-w-[62ch]">
                  손패의 카드를 바닥의 같은 달 카드와 맞추면 두 장을 가져와요. 광을 3장 모으면
                  3점이에요.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-ink-soft">
                  16px · 500 medium · labels · 700 bold · emphasis
                </div>
                <p className="text-base font-medium">
                  Winner · 승자 &nbsp;·&nbsp; Go count · 고 횟수
                </p>
                <p className="text-base font-bold">
                  Chips are tracked here. 칩은 여기에서만 기록돼요.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-ink-soft">14px small · 12px caption in soft ink</div>
                <p className="text-sm">Settle up in person. 정산은 직접 만나서 해요.</p>
                <p className="text-xs text-ink-soft uppercase tracking-wider">
                  Hand 4 of 9 · 4번째 판
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-ink-soft">
                  Numbers: Plex is tabular (left), Fraunces is not (right)
                </div>
                <div className="grid grid-cols-2 gap-6 text-xl">
                  <div className="font-medium tabular-nums text-right leading-snug">
                    1,111
                    <br />
                    8,080
                    <br />
                    +12
                  </div>
                  <div className="font-display tabular-nums text-right leading-snug">
                    1,111
                    <br />
                    8,080
                    <br />
                    +12
                  </div>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed max-w-[52ch]">
                  Fraunces digits are lining (as tall as capitals) but proportional: the copy of the
                  font that Google serves has no tabular figures. So columns, chip counts and
                  count-up numbers use Plex, and only a lone big score uses Fraunces.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 3. Pieces ──────────────────────────────────────────────────── */}
        <Section
          n="03"
          title="Card, input, chip, filter row, button"
          note="Separation comes from color: surface on paper. The card has a 1px hairline and nothing else does. No shadows. Corners: 10px on cards, 8px on inputs, full pills on chips and buttons. Press a button: it darkens to plum-deep and moves 1px down."
        >
          <div className="grid gap-10 md:grid-cols-2">
            <div className="club-card p-8 space-y-3">
              <div className="font-display text-3xl">Tonight</div>
              <p className="leading-relaxed">
                A card panel: surface on paper, 1px hairline, 10px corners, no shadow.
              </p>
              <p className="text-sm text-ink-soft">
                카드 패널이에요. 종이 위의 밝은 면, 가는 실선 하나.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <Label>Input · 8px corners, no border</Label>
                <input
                  className="club-input w-full"
                  placeholder="Event name · 이벤트 이름"
                  aria-label="Event name"
                />
              </div>
              <div>
                <Label>Chip · resting and selected</Label>
                <div className="flex gap-3 flex-wrap items-center">
                  <span className="club-chip">Resting</span>
                  <span className="club-chip" aria-pressed="true">
                    Selected
                  </span>
                </div>
              </div>
              <div>
                <Label>Filter row · tap to select</Label>
                <FilterRow />
              </div>
            </div>
          </div>

          <div>
            <Label>Buttons</Label>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
              <button type="button" className="club-btn club-btn--primary">
                Deal · 나눠주기
              </button>
              <button type="button" className="club-btn">
                Undo · 되돌리기
              </button>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <button type="button" className="club-btn club-btn--primary is-pressed">
                  Stop! · 스톱
                </button>
                <span className="text-sm text-ink-soft">held down: plum-deep, 1px lower</span>
              </span>
            </div>
          </div>
        </Section>

        {/* ── 4. Grain ───────────────────────────────────────────────────── */}
        <Section
          n="04"
          title="Paper grain"
          note="The whole page carries the planned 5% grain (the range is 4 to 6%). These three samples sit above it so you can compare none, the planned strength, and double. Look at the colored bars as well as the paper."
        >
          <div className="grid gap-8 sm:grid-cols-3">
            {GRAIN_SAMPLES.map((g) => (
              <div key={g.label} className="space-y-3">
                <div className="text-sm">
                  <span className="font-bold">{g.label}</span>{' '}
                  <span className="text-ink-soft">{g.note}</span>
                </div>
                <div
                  className="grain-layer rounded-card overflow-hidden bg-paper"
                  style={{ '--grain-strength': g.strength } as CSSProperties}
                >
                  <div className="flex h-8">
                    <div className="flex-1 bg-plum" />
                    <div className="flex-1 bg-gold" />
                    <div className="flex-1 bg-sage" />
                    <div className="flex-1 bg-sky" />
                    <div className="flex-1 bg-ink" />
                  </div>
                  <div className="p-5 bg-surface">
                    <div className="font-bold">Body text sample</div>
                    <div className="text-sm text-ink-soft">Soft text sample · 보조 텍스트</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 5. Card + scorecard ────────────────────────────────────────── */}
        <Section
          n="05"
          title="A hwatu card and a scorecard row"
          note="The hwatu image keeps the red frame from its own art, with no border or shadow added. Beside it goes the shared 3-line caption from hwatu.ts. In the scorecard, colored dots carry the gain and the tick, and the numbers stay ink."
        >
          <div className="grid gap-8 md:grid-cols-[auto_1fr] items-start">
            <div className="club-card p-6 flex gap-6 items-start">
              <div className="w-28 shrink-0 aspect-[2/3] relative">
                <HwatuCardImage card={card} className="absolute inset-0 w-full h-full" />
              </div>
              <CardCaption card={card} className="max-w-44" />
            </div>

            <div className="space-y-5">
              <div className="club-card p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-bold text-lg truncate">Mina · 미나</div>
                    <div className="text-xs text-ink-soft uppercase tracking-wider">
                      Won 3 hands · 3판 승
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 sm:gap-10 text-right tabular-nums whitespace-nowrap">
                    <div>
                      <div className="text-xs text-ink-soft uppercase tracking-wider">Chips</div>
                      <div className="font-bold text-3xl leading-none mt-2">152</div>
                    </div>
                    <div>
                      <div className="text-xs text-ink-soft uppercase tracking-wider">Net</div>
                      <div className="font-bold text-xl mt-2 inline-flex items-center gap-2">
                        <span aria-hidden className="size-2.5 rounded-full bg-sage" />
                        +52
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-ink-soft uppercase tracking-wider">Value</div>
                      <div className="font-medium text-xl mt-2">$15.20</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="club-chip">
                  <span
                    aria-hidden
                    className="size-5 shrink-0 rounded-full bg-sage grid place-items-center text-xs font-bold"
                    style={{ color: 'var(--palette-ink-light)' }}
                  >
                    ✓
                  </span>
                  <span className="tabular-nums">300 chips on the table = 300 bought in</span>
                </span>
                <span className="text-sm text-ink-soft">
                  Chips are tracked here — settle up in person.
                </span>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
