'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/theme-context';

// ── Color math (WCAG contrast). Runs in the browser on the LIVE token values,
// so the page can't drift from globals.css. ──────────────────────────────────
type Rgb = [number, number, number];

const channel = (c: number) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgb) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a: Rgb, b: Rgb) => {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const toHex = ([r, g, b]: Rgb) =>
  `#${[r, g, b]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;

/** Turns any CSS color (even one with transparency) into plain RGB by painting it over `over`. */
function resolveColor(css: string, over: Rgb): Rgb {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = `rgb(${over.join(',')})`;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

// How each measurement is graded.
//   text  = normal text, needs 4.5:1
//   large = large text (24px, or 19px bold), needs 3:1
//   icon  = dots and icons, needs 3:1
//   info  = just a number, no grade
type Kind = 'text' | 'large' | 'icon' | 'info';
function grade(kind: Kind, r: number): string {
  if (kind === 'info') return '';
  if (kind === 'text') return r >= 4.5 ? '✓ AA' : r >= 3 ? '◐ large text only' : '✕ fails';
  if (kind === 'large') return r >= 4.5 ? '✓ AA' : r >= 3 ? '✓ AA large' : '✕ fails';
  return r >= 3 ? '✓ 3:1' : '✕ under 3:1';
}

type Row = readonly [label: string, fg: string, bg: string, kind: Kind];
type Token = {
  name: string;
  use: string;
  /** What to draw in the sample block: background token, and text token. */
  sample: { bg: string; fg: string };
  rows: ReadonlyArray<Row>;
};

// One entry per token in globals.css. `rows` are the contrast checks that matter for that token.
export const TOKENS: ReadonlyArray<Token> = [
  {
    name: 'paper',
    use: 'Page background',
    sample: { bg: 'paper', fg: 'ink' },
    rows: [
      ['Ink on paper', 'ink', 'paper', 'text'],
      ['Surface vs paper', 'surface', 'paper', 'info'],
    ],
  },
  {
    name: 'surface',
    use: 'Cards, panels, inputs',
    sample: { bg: 'surface', fg: 'ink' },
    rows: [
      ['Ink on surface', 'ink', 'surface', 'text'],
      ['Surface vs paper', 'surface', 'paper', 'info'],
    ],
  },
  {
    name: 'ink',
    use: 'Body text, hairlines',
    sample: { bg: 'ink', fg: 'surface' },
    rows: [
      ['On paper', 'ink', 'paper', 'text'],
      ['On surface', 'ink', 'surface', 'text'],
    ],
  },
  {
    name: 'ink-soft',
    use: 'Captions, secondary text',
    sample: { bg: 'paper', fg: 'ink-soft' },
    rows: [
      ['On paper', 'ink-soft', 'paper', 'text'],
      ['On surface', 'ink-soft', 'surface', 'text'],
    ],
  },
  {
    name: 'hairline',
    use: 'Card borders, dividers',
    sample: { bg: 'paper', fg: 'hairline' },
    rows: [
      ['Line vs surface', 'hairline', 'surface', 'info'],
      ['Line vs paper', 'hairline', 'paper', 'info'],
    ],
  },
  {
    name: 'plum',
    use: 'Primary buttons, selected, Ribbon, wordmark',
    sample: { bg: 'plum', fg: 'surface' },
    rows: [
      ['Wordmark on paper (large)', 'plum', 'paper', 'large'],
      ['Button label: surface on plum', 'surface', 'plum', 'large'],
    ],
  },
  {
    name: 'plum-deep',
    use: 'Pressed state',
    sample: { bg: 'plum-deep', fg: 'surface' },
    rows: [
      ['Pressed label: surface on it', 'surface', 'plum-deep', 'large'],
      ['Large text on paper', 'plum-deep', 'paper', 'large'],
    ],
  },
  {
    name: 'gold',
    use: 'Bright type. Fill, dot or icon only',
    sample: { bg: 'gold', fg: 'palette-ink-light' },
    rows: [
      ['Dot or icon vs surface', 'gold', 'surface', 'icon'],
      ['Dark green text on it', 'palette-ink-light', 'gold', 'text'],
    ],
  },
  {
    name: 'sage',
    use: 'Junk type, success. Fill, dot or icon only',
    sample: { bg: 'sage', fg: 'palette-ink-light' },
    rows: [
      ['Dot or icon vs surface', 'sage', 'surface', 'icon'],
      ['Dark green text on it', 'palette-ink-light', 'sage', 'text'],
    ],
  },
  {
    name: 'sky',
    use: 'Blue-ribbon combo. Fill, dot or icon only',
    sample: { bg: 'sky', fg: 'surface' },
    rows: [
      ['Dot or icon vs surface', 'sky', 'surface', 'icon'],
      ['Surface on sky', 'surface', 'sky', 'text'],
    ],
  },
];

// Token names become --color-NAME. Names starting with `palette-` point straight at the palette
// (used for "the dark green that stays dark in both modes", i.e. --palette-ink-light).
const cssVar = (name: string) =>
  name.startsWith('palette-') ? `var(--${name})` : `var(--color-${name})`;

function Swatch({ t }: { t: Token }) {
  // The surface swatch sits on paper, so you can see that it reads lighter.
  const cardStyle = t.name === 'surface' ? { background: cssVar('paper') } : undefined;
  return (
    <div data-token={t.name} className="club-card p-5" style={cardStyle}>
      <div
        className="rounded-input h-16 grid place-items-center font-display text-2xl"
        style={{ background: cssVar(t.sample.bg), color: cssVar(t.sample.fg) }}
      >
        {t.name === 'hairline' ? (
          <div
            className="w-3/4"
            style={{ height: 'var(--hairline-width)', background: cssVar('hairline') }}
          />
        ) : (
          'Aa'
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-2">
        <span className="font-bold text-lg">{t.name}</span>
        <span data-out="hex" className="text-sm tabular-nums text-ink-soft" />
      </div>
      <div className="text-xs text-ink-soft">
        --color-{t.name} · {t.use}
      </div>
      <div className="mt-4 space-y-1.5">
        {t.rows.map(([label], i) => (
          <div key={i} data-row={i} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-ink-soft">{label}</span>
            <span className="whitespace-nowrap tabular-nums">
              <b data-out="ratio" /> <span data-out="grade" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Every color token with its live hex and the contrast checks that matter for it. */
export function ColorSwatches() {
  const { theme } = useTheme();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The theme class is applied by the provider after this effect, so wait a beat.
    const id = window.setTimeout(() => {
      const el = root.current;
      if (!el) return;
      const probe = (name: string) =>
        getComputedStyle(el.querySelector<HTMLElement>(`[data-probe="${name}"]`)!).backgroundColor;
      const paper = resolveColor(probe('paper'), [255, 255, 255]);
      // Every opaque token, painted over paper. (Alpha tokens are painted over the row's own background below.)
      const rgb = (name: string, over: Rgb) => resolveColor(probe(name), over);
      const root$ = getComputedStyle(document.documentElement);

      TOKENS.forEach((t) => {
        const card = el.querySelector<HTMLElement>(`[data-token="${t.name}"]`)!;
        const hexEl = card.querySelector<HTMLElement>('[data-out="hex"]')!;
        if (t.name === 'ink-soft')
          hexEl.textContent = `ink at ${root$.getPropertyValue('--ink-soft-strength').trim()}`;
        else if (t.name === 'hairline')
          hexEl.textContent = `ink at ${root$.getPropertyValue('--hairline-strength').trim()}`;
        else hexEl.textContent = toHex(rgb(t.name, paper));

        t.rows.forEach(([, fg, bg, kind], i) => {
          const rowEl = card.querySelector<HTMLElement>(`[data-row="${i}"]`)!;
          const bgRgb = rgb(bg, paper);
          const fgRgb = rgb(fg, bgRgb);
          const r = ratio(fgRgb, bgRgb);
          rowEl.querySelector<HTMLElement>('[data-out="ratio"]')!.textContent = `${r.toFixed(2)}:1`;
          rowEl.querySelector<HTMLElement>('[data-out="grade"]')!.textContent = grade(kind, r);
        });
      });
    }, 80);
    return () => window.clearTimeout(id);
  }, [theme]);

  return (
    <div ref={root}>
      {/* Hidden probes: one element per token, so the browser can tell us its real color. */}
      <div hidden>
        {[...TOKENS.map((t) => t.name), 'palette-ink-light'].map((name) => (
          <span key={name} data-probe={name} style={{ background: cssVar(name) }} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOKENS.map((t) => (
          <Swatch key={t.name} t={t} />
        ))}
      </div>
    </div>
  );
}

/** Light / Dark switch. `?theme=dark` in the address bar also works (used for screenshots). */
export function ThemeControls() {
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('theme');
    if (wanted === 'light' || wanted === 'dark') setTheme(wanted);
  }, [setTheme]);
  return (
    <div className="flex items-center gap-3 flex-wrap" role="group" aria-label="Theme">
      <button
        type="button"
        className="club-chip"
        aria-pressed={theme === 'light'}
        onClick={() => setTheme('light')}
      >
        Light
      </button>
      <button
        type="button"
        className="club-chip"
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
      >
        Dark
      </button>
    </div>
  );
}

const FILTERS = [
  { id: 'all', label: 'All', dot: null },
  { id: 'bright', label: 'Bright', dot: 'gold' },
  { id: 'animal', label: 'Animal', dot: 'ink' },
  { id: 'ribbon', label: 'Ribbon', dot: 'plum' },
  { id: 'junk', label: 'Junk', dot: 'sage' },
] as const;

/** Tap a chip to select it. No border at rest; the selected one is a solid plum pill. */
export function FilterRow() {
  const [active, setActive] = useState<string>('all');
  return (
    <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filter cards by type">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          className="club-chip"
          aria-pressed={active === f.id}
          onClick={() => setActive(f.id)}
        >
          {f.dot && (
            <span
              aria-hidden
              className="size-2.5 rounded-full"
              // On the selected (plum) chip the dot turns surface-colored so it never disappears.
              style={{ background: active === f.id ? cssVar('surface') : cssVar(f.dot) }}
            />
          )}
          {f.label}
        </button>
      ))}
    </div>
  );
}

/** Marks the page as fully drawn (fonts loaded, colors measured) so screenshots know when to fire. */
export function ScreenshotReady() {
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      window.setTimeout(() => {
        if (cancelled) return;
        document.body.dataset.styleReady = '1';
        document.body.dataset.styleHeight = String(document.documentElement.scrollHeight);
      }, 700);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
