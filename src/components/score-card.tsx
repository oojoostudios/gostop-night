import { HwatuCardImage } from '@/components/hwatu-card-image';
import { MONTHS, isDoubleJunk, type HwatuCard } from '@/lib/hwatu';
import { BIGWANG_ID } from '@/lib/score';

/**
 * One card as shown in Section 04 (the summary blocks and the calculator): the image,
 * a small ink "Rain" or "×2" pill where it applies, and the month caption underneath —
 * two lines, `3월` then `Mar` — the month number and abbreviation, not the section's
 * language toggle.
 */
export function ScoreCardArt({
  card,
  ko,
  showMonth = true,
}: {
  card: HwatuCard;
  ko: boolean;
  showMonth?: boolean;
}) {
  const isRain = card.id === BIGWANG_ID;
  const isDouble = isDoubleJunk(card);
  return (
    <div>
      <div className="relative aspect-[331/502] w-full">
        <HwatuCardImage card={card} className="absolute inset-0 h-full w-full rounded-[5px]" />
        {isRain && (
          <span className="absolute -top-1.5 -right-1.5 rounded-full bg-ink px-1.5 py-0.5 text-label leading-none font-bold text-paper">
            {ko ? '비' : 'Rain'}
          </span>
        )}
        {isDouble && (
          <span className="absolute -top-1.5 -right-1.5 rounded-full bg-ink px-1.5 py-0.5 text-label leading-none font-bold text-paper">
            ×2
          </span>
        )}
      </div>
      {showMonth && (
        <div className="mt-1 text-center leading-snug text-label text-ink-soft">
          <div>{card.month}월</div>
          <div>{MONTHS[card.month - 1].abbr}</div>
        </div>
      )}
    </div>
  );
}
