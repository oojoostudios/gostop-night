/**
 * The big "GoStop Club" wordmark lockup — the hero's raster logo export, cropped from
 * assets-source/brand/logo-wordmark.png (see scripts/export-wordmark.mjs). Not the same
 * thing as the small text <Wordmark> in the header and sidebar.
 *
 * Light mode: sits flush on the page (its baked-in background is the same as `paper`).
 * Dark mode: `.wordmark-frame` (globals.css) turns into a light-paper rounded panel, so
 * its square background never shows as a box on the dark page.
 */
export function WordmarkLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark-frame ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/wordmark-720.webp"
        srcSet="/brand/wordmark-360.webp 360w, /brand/wordmark-720.webp 720w"
        sizes="(min-width: 640px) 420px, 80vw"
        alt="GoStop Club · EST. 2026"
        draggable={false}
      />
    </span>
  );
}
