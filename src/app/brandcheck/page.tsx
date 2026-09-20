import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ScreenshotReady, ThemeControls } from '../stylecheck/parts';

// Internal brand QA page. Not linked from the site, not for guests.
// Shows the mascot and the wordmark on light paper and on dark, the way the
// site will use them. Everything is drawn with the tokens in globals.css.
export const metadata: Metadata = {
  title: 'Brand check',
  robots: { index: false, follow: false },
};

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

/** A card that forces one theme, whatever the page is set to. Paper-colored, like the page it stands for. */
function Island({
  mode,
  title,
  children,
  className = '',
}: {
  mode: 'light' | 'dark';
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${mode} club-card p-6 space-y-5 ${className}`}
      style={{ background: 'var(--color-paper)' }}
    >
      <div className="text-xs uppercase tracking-wider text-ink-soft">{title}</div>
      {children}
    </div>
  );
}

const Mascot = ({ className = '', small }: { className?: string; small?: boolean }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={small ? '/brand/mascot-sm.webp' : '/brand/mascot-hero.webp'}
    alt="Club Go Stop mascot: a red plum-blossom character"
    className={className}
    draggable={false}
  />
);

/** The mascot on its round paper badge (used on dark). */
const Badge = ({ size, small }: { size: string; small?: boolean }) => (
  <div className={`mascot-badge shrink-0 ${size}`}>
    <Mascot small={small} className="w-[78%]" />
  </div>
);

const Wordmark = ({ size }: { size: 'lg' | 'sm' }) => (
  <div className="min-w-0">
    <div
      className={`font-display text-plum leading-none ${size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-xl'}`}
    >
      Club Go Stop
    </div>
    <div
      className={`font-display mt-1.5 leading-tight ${size === 'lg' ? 'text-2xl' : 'text-sm text-ink-soft'}`}
    >
      클럽 고스톱
    </div>
  </div>
);

export default function BrandCheckPage() {
  return (
    <main className="min-h-screen bg-paper text-ink px-5 sm:px-10 py-14">
      <ScreenshotReady />
      <div className="mx-auto max-w-5xl space-y-28">
        <header className="space-y-6">
          <h1 className="font-display text-5xl leading-tight">
            Brand check <span className="text-ink-soft">· 브랜드 체크</span>
          </h1>
          <p className="max-w-[62ch] text-ink-soft leading-relaxed">
            Internal QA page, not linked from the site. The mascot and the wordmark on light paper
            and on dark. Colors and type are on{' '}
            <code className="font-mono text-sm">/stylecheck</code>.
          </p>
          <ThemeControls />
        </header>

        {/* ── 1. Mascot ──────────────────────────────────────────────────── */}
        <Section
          n="01"
          title="Mascot"
          note="On light paper the mascot sits straight on the page. On dark green its outlines are the same color as the background, so on dark it always goes on a round badge. The badge uses the light paper color in both modes, with no outline and no shadow: the change of color is its edge."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <Island mode="light" title="Light · no badge">
              <Mascot className="w-52 mx-auto" />
            </Island>
            <Island mode="dark" title="Dark · no badge (the problem)">
              <Mascot className="w-52 mx-auto" />
            </Island>
            <Island mode="dark" title="Dark · with badge (used)">
              <Badge size="w-52 mx-auto" />
            </Island>
          </div>
        </Section>

        {/* ── 2. Lockup ──────────────────────────────────────────────────── */}
        <Section
          n="02"
          title="Mascot and wordmark"
          note="The hero: the mascot large, next to the wordmark. Fraunces 600 for Club Go Stop and Gowun Batang Bold for 클럽 고스톱, both in the same weight and the plum of the logo."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Island mode="light" title="Light">
              <div className="flex items-center gap-6">
                <Mascot className="w-28 sm:w-36 shrink-0" />
                <Wordmark size="lg" />
              </div>
            </Island>
            <Island mode="dark" title="Dark">
              <div className="flex items-center gap-6">
                <Badge size="w-28 sm:w-36" />
                <Wordmark size="lg" />
              </div>
            </Island>
          </div>
        </Section>

        {/* ── 3. Header size ─────────────────────────────────────────────── */}
        <Section
          n="03"
          title="Header size"
          note="The small mascot (96px file) in the top bar, next to a small wordmark. Cards are surface on paper with the one hairline."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Island mode="light" title="Light">
              <div className="club-card flex items-center gap-3 px-4 h-16">
                <Mascot small className="w-9 shrink-0" />
                <Wordmark size="sm" />
              </div>
            </Island>
            <Island mode="dark" title="Dark">
              <div className="club-card flex items-center gap-3 px-4 h-16">
                <Badge size="w-11" small />
                <Wordmark size="sm" />
              </div>
            </Island>
          </div>
        </Section>
      </div>
    </main>
  );
}
