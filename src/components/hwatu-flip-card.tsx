'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { Modal } from '@heroui/react';
import { useLocale } from '@/contexts/locale-context';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import {
  MONTHS,
  cardCombo,
  cardTypeLabels,
  isDoubleJunk,
  monthHeader,
  type HwatuCard,
} from '@/lib/hwatu';

// Card-type dot colors (globals.css): each gets a 1px ink ring via `.type-dot`.
const TYPE_DOT = {
  gwang: 'type-dot bg-type-bright',
  kkeut: 'type-dot bg-type-animal',
  tti: 'type-dot bg-type-ribbon',
  pi: 'type-dot bg-type-junk',
} as const;

/**
 * A tapped card, enlarged in the middle of the screen (Section 01).
 * It opens already turning over to show its details on the back. Tap the card to turn it
 * back and forth. Tap outside it, the close button, or press Esc to put it away.
 * (HeroUI's Modal takes care of focus, Esc and scroll lock.)
 */
export function FlipCardModal({
  card,
  isOpen,
  onClose,
}: {
  card: HwatuCard | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop variant="opaque" className="bg-scrim">
        <Modal.Container placement="center">
          <Modal.Dialog
            aria-label={locale === 'ko' ? '카드 자세히 보기' : 'Card details'}
            className="!w-auto !max-w-none !overflow-visible !bg-transparent !p-0 !shadow-none"
          >
            {/* Sits above the card, on the dimmed page, so it never disappears against the card. */}
            <Modal.CloseTrigger
              aria-label={locale === 'ko' ? '닫기' : 'Close'}
              className="!absolute !-top-14 !right-0 !flex !size-10 !items-center !justify-center !rounded-full !bg-surface !text-ink"
            />
            {card && <FlipCard key={card.id} card={card} />}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function FlipCard({ card }: { card: HwatuCard }) {
  const { locale } = useLocale();
  const reduce = useReducedMotion();
  // Starts turned to the back: the card opens and turns over in one go.
  const [flipped, setFlipped] = useState(true);
  const [scope, animate] = useAnimate();

  // A slight scale-up while the card turns (skipped when the visitor asked for less motion).
  const bump = () => {
    if (reduce || !scope.current) return;
    animate(scope.current, { scale: [1, 1.06, 1] }, { duration: 0.45, ease: 'easeInOut' });
  };
  useEffect(bump, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = () => {
    setFlipped((f) => !f);
    bump();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flip();
    }
  };

  const ko = locale === 'ko';
  const month = MONTHS[card.month - 1];
  const type = cardTypeLabels(card);
  const combo = cardCombo(card, locale);
  // Names: the current language first.
  const [nameMain, nameOther] = ko ? [card.nameKo, card.name] : [card.name, card.nameKo];
  const dot = isDoubleJunk(card) ? TYPE_DOT.pi : TYPE_DOT[card.type];
  const lore = ko ? card.loreKo : card.lore;

  const faceBase = 'absolute inset-0';
  const label = 'mb-1 text-xs uppercase tracking-wider text-ink-soft';

  const front = <HwatuCardImage card={card} className="absolute inset-0 h-full w-full" />;
  const back = (
    <div className="flex h-full flex-col overflow-y-auto rounded-card border border-hairline bg-surface p-6 text-ink">
      <div className="text-xs uppercase tracking-[0.14em] text-ink-soft">{monthHeader(month)}</div>
      <h3 className="mt-4 font-display text-3xl leading-tight">{nameMain}</h3>
      <p className="mt-1 text-lg">{nameOther}</p>
      <dl className="mt-6 space-y-5 text-sm">
        <div>
          <dt className={label}>{ko ? '종류' : 'Type'}</dt>
          <dd className="flex items-center gap-2 text-base font-medium">
            <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${dot}`} />
            {ko ? `${type.ko} ${type.en}` : `${type.en} ${type.ko}`}
          </dd>
        </div>
        {combo && (
          <div>
            <dt className={label}>{ko ? '조합' : 'Combo'}</dt>
            <dd className="text-base font-medium">{combo}</dd>
          </div>
        )}
        {lore && (
          <div>
            <dt className={label}>{ko ? '이야기' : 'Story'}</dt>
            <dd className="leading-relaxed text-ink-soft">{lore}</dd>
          </div>
        )}
      </dl>
    </div>
  );

  const size = {
    height: 'min(78vh, 34rem)',
    aspectRatio: '2 / 3',
    maxWidth: '92vw',
  } as const;

  return (
    <div style={{ perspective: 1200 }}>
      <div ref={scope} style={size}>
        <div
          role="button"
          tabIndex={0}
          onClick={flip}
          onKeyDown={onKey}
          aria-label={
            flipped
              ? ko
                ? '카드 앞면 보기'
                : 'Show the front of the card'
              : ko
                ? '카드 자세히 보기'
                : 'Show the details'
          }
          className="relative h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum"
        >
          {reduce ? (
            // Less motion: no turning. The two sides cross-fade instead.
            <>
              <motion.div
                className={faceBase}
                initial={false}
                animate={{ opacity: flipped ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                aria-hidden={flipped}
              >
                {front}
              </motion.div>
              <motion.div
                className={faceBase}
                initial={false}
                animate={{ opacity: flipped ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden={!flipped}
              >
                {back}
              </motion.div>
            </>
          ) : (
            // Turns on the vertical axis; each side hides when it faces away.
            <motion.div
              className="relative h-full w-full"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0.12 }}
            >
              <div
                className={faceBase}
                style={{ backfaceVisibility: 'hidden' }}
                aria-hidden={flipped}
              >
                {front}
              </div>
              <div
                className={faceBase}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                aria-hidden={!flipped}
              >
                {back}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
