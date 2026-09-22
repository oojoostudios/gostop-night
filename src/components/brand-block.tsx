import Link from 'next/link';

/**
 * The brand block: the short wordmark logo ("GoStop Club", no "EST. 2026"), linking home.
 * Shared by the sidebar and the mobile top bar so both match.
 *
 * Light mode: sits flush on the page (its baked-in background is `paper`).
 * Dark mode: `.wordmark-frame` (globals.css) turns it into a light-paper rounded panel,
 * the same treatment as the hero's big wordmark.
 */
export function BrandBlock({ className = '' }: { className?: string }) {
  return (
    <Link href="/gostop" className={`wordmark-frame ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/wordmark-short-180.webp" alt="GoStop Club · 고스톱 클럽" draggable={false} />
    </Link>
  );
}
