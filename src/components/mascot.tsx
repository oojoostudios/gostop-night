/**
 * The Club Go Stop mascot, in its square frame.
 *
 * Light mode: the mascot sits straight on the page.
 * Dark mode: the frame becomes a round light-paper badge (see `.mascot-frame` in
 * globals.css), because the mascot's dark outlines would disappear on the dark page.
 *
 * Size it with a width class on `className` (the frame is always square).
 * Use `size="sm"` (96px file) for anything under about 56px wide, otherwise the hero file.
 * Leave `alt` empty when the mascot sits next to the wordmark (it is decoration then).
 */
export function Mascot({
  size = 'hero',
  alt = '',
  className = '',
}: {
  size?: 'hero' | 'sm';
  alt?: string;
  className?: string;
}) {
  return (
    <span className={`mascot-frame ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={size === 'sm' ? '/brand/mascot-sm.webp' : '/brand/mascot-hero.webp'}
        alt={alt}
        aria-hidden={alt === '' ? true : undefined}
        draggable={false}
      />
    </span>
  );
}
