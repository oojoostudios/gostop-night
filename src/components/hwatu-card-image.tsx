import type { HwatuCard as HwatuCardData } from '@/lib/hwatu';

/**
 * Renders a single hwatu card image.
 *
 * Uses a plain <img> rather than next/image because:
 *   - The cards are user-supplied PNGs in /public/cards (no remote source)
 *   - We always size them via CSS (object-cover inside an aspect-[2/3] box)
 *   - next/image would need explicit width/height per card, which doesn't
 *     buy us much for these tiny pre-sized assets
 *
 * Accepts EITHER a HwatuCard data object (most call sites) OR a raw path
 * string (used by the Hero card fan, which works from path literals).
 */

type Props = {
  className?: string;
  /** Optional accessible label. Falls back to the card's Korean name. */
  ariaLabel?: string;
} & ({ card: HwatuCardData; path?: never } | { path: string; card?: never });

export function HwatuCardImage(props: Props) {
  const { className, ariaLabel } = props;
  const src = 'card' in props && props.card ? props.card.image : props.path;
  const label = ariaLabel ?? ('card' in props && props.card ? props.card.nameKo : '');
  return (
    <img
      src={src}
      alt={label}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}
