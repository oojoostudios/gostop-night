'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Modal } from '@heroui/react';
import { RULES, bakRules, callThreshold, type Players } from '@/config/rules';
import { useLocale } from '@/contexts/locale-context';
import {
  BAK_FACTOR,
  NO_BAK,
  calcHand,
  nextHandDoubled,
  type BakFlags,
  type HandCalc,
  type HandInput,
  type LoserCalc,
  type TonightEvent,
} from '@/lib/tonight';

/* -------------------------------------------------------------------------- */
/* The maths, written out in one line per loser                                */
/* -------------------------------------------------------------------------- */

const BAK_LABEL = {
  pi: { en: 'Pi-bak', ko: '피박' },
  gwang: { en: 'Gwang-bak', ko: '광박' },
  meong: { en: 'Meong-bak', ko: '멍박' },
} as const;

/** "4 pts + 1 Go = 5 × shake 2 = 10 chips", plus the Go-bak result when it applies. */
function mathLine(
  input: HandInput,
  calc: HandCalc,
  loser: LoserCalc,
  names: Record<string, string>,
  playerCount: number,
  ko: boolean,
): string {
  const t = (en: string, kr: string) => (ko ? kr : en);
  // Korean puts the unit right after the number ("3점"); English leaves a space ("3 pts").
  const u = (n: number, unit: string) => `${n}${ko ? '' : ' '}${unit}`;
  const chips = t('chips', '칩');
  const base =
    input.gos > 0
      ? `${u(input.points, t('pts', '점'))} + ${u(input.gos, t('Go', '고'))} = ${calc.afterGos}`
      : u(input.points, t('pts', '점'));
  const factors: string[] = [];
  if (calc.shakeFactor !== 1) factors.push(`${t('shake', '흔들기')} ${calc.shakeFactor}`);
  if (calc.bombFactor !== 1) factors.push(`${t('bomb', '폭탄')} ${calc.bombFactor}`);
  if (calc.drawFactor !== 1) factors.push(`${t('draw', '나가리')} ${calc.drawFactor}`);
  for (const b of loser.bak) factors.push(`${BAK_LABEL[b][ko ? 'ko' : 'en']} ${BAK_FACTOR}`);
  if (calc.chipsPerPoint !== 1) factors.push(u(calc.chipsPerPoint, t('chips/pt', '칩/점')));
  let line = `${base}${factors.map((f) => ` × ${f}`).join('')} = ${u(loser.share, chips)}`;

  const goBakers = calc.losers.filter((l) => l.goBak);
  if (goBakers.length > 0) {
    if (playerCount <= 2) {
      line += ` → ${t('Go-bak: pays double', '고박: 두 배')} = ${u(loser.pays, chips)}`;
    } else if (loser.goBak) {
      line += ` → ${t('Go-bak: pays for the table', '고박: 판 전체를 물어요')} = ${u(loser.pays, chips)}`;
    } else {
      const who = goBakers.map((l) => names[l.playerId]).join(', ');
      line += ` → ${t(`covered by ${who}`, `대신 내는 사람: ${who}`)} = ${u(0, chips)}`;
    }
  }
  return line;
}

/* -------------------------------------------------------------------------- */
/* Small controls                                                              */
/* -------------------------------------------------------------------------- */

function Stepper({
  label,
  hint,
  value,
  min = 0,
  max,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min?: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const btn = 'club-btn size-10 !p-0 disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-body font-medium">{label}</div>
        {hint && <div className="text-label text-ink-soft">{hint}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className={btn}
          aria-label={`${label} −1`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus className="size-4" />
        </button>
        <span className="w-9 text-center text-sub font-bold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          className={btn}
          aria-label={`${label} +1`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1 text-body">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 shrink-0 accent-plum"
      />
      <span>{children}</span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* The dialog                                                                  */
/* -------------------------------------------------------------------------- */

export function RecordHandDialog({
  ev,
  isOpen,
  initialPoints,
  onClose,
  onSaveHand,
  onSaveDraw,
}: {
  ev: TonightEvent;
  isOpen: boolean;
  /** Prefills the points stepper — carried over from the Section 04 calculator's
   * "Use this score in Game Time" button. */
  initialPoints?: number;
  onClose: () => void;
  onSaveHand: (input: HandInput) => void;
  onSaveDraw: () => void;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
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
            aria-label={ko ? '판 기록' : 'Record a hand'}
            className="!w-auto !max-w-none !overflow-visible !bg-transparent !p-0 !shadow-none"
          >
            {/* Sits above the card, on the dimmed page, so it never disappears against the card. */}
            <Modal.CloseTrigger
              aria-label={ko ? '닫기' : 'Close'}
              className="!absolute !-top-14 !right-0 !flex !size-10 !items-center !justify-center !rounded-full !bg-surface !text-ink"
            />
            {/* A fresh form every time the dialog opens */}
            {isOpen && (
              <HandForm
                ev={ev}
                initialPoints={initialPoints}
                onCancel={onClose}
                onSaveHand={(input) => {
                  onSaveHand(input);
                  onClose();
                }}
                onSaveDraw={() => {
                  onSaveDraw();
                  onClose();
                }}
              />
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function HandForm({
  ev,
  initialPoints,
  onCancel,
  onSaveHand,
  onSaveDraw,
}: {
  ev: TonightEvent;
  initialPoints?: number;
  onCancel: () => void;
  onSaveHand: (input: HandInput) => void;
  onSaveDraw: () => void;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const playerCount = ev.players.length;
  const afterDraw = nextHandDoubled(ev);

  const [winner, setWinner] = useState<string | 'draw' | null>(null);
  const [points, setPoints] = useState<number>(
    initialPoints ?? callThreshold(playerCount as Players),
  );
  const [gos, setGos] = useState(0);
  const [shakes, setShakes] = useState(0);
  const [bombs, setBombs] = useState(0);
  const [flags, setFlags] = useState<Record<string, BakFlags>>({});

  const names = Object.fromEntries(ev.players.map((p) => [p.id, p.name]));
  const isDraw = winner === 'draw';
  const winnerId = winner && !isDraw ? winner : null;
  const losers = winnerId ? ev.players.filter((p) => p.id !== winnerId) : [];
  const flagsOf = (id: string): BakFlags => flags[id] ?? NO_BAK;
  const setFlag = (id: string, key: keyof BakFlags, v: boolean) =>
    setFlags((f) => ({ ...f, [id]: { ...(f[id] ?? NO_BAK), [key]: v } }));

  // Only the penalties that are switched on in rules.ts get a checkbox.
  const bakOn = bakRules(RULES).filter((r) => r.on);
  const goBakOn = RULES.goBak;

  const input: HandInput | null = winnerId
    ? {
        winnerId,
        points,
        gos,
        shakes,
        bombs,
        afterDraw,
        losers: Object.fromEntries(losers.map((l) => [l.id, flagsOf(l.id)])),
      }
    : null;
  const calc = input ? calcHand(input, ev.chipsPerPoint, playerCount) : null;

  const sectionTitle = 'mb-2 text-label uppercase tracking-[0.18em] font-bold text-ink-soft';

  return (
    <div
      className="club-card max-h-[82vh] w-[min(92vw,30rem)] overflow-y-auto p-5 sm:p-6"
      data-testid="record-hand"
    >
      <h3 className="font-display text-sub">{t('Record a hand', '판 기록')}</h3>
      {afterDraw && (
        <p className="mt-2 inline-block rounded-full bg-gold px-3 py-1 text-label font-medium text-on-fill">
          {t('Draw last time — this hand counts ×2', '지난 판 나가리 — 이번 판은 ×2')}
        </p>
      )}

      <div className="mt-5">
        <div className={sectionTitle}>{t('Who won?', '누가 이겼나요?')}</div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('Winner', '승자')}>
          {ev.players.map((p) => (
            <button
              key={p.id}
              type="button"
              className="club-chip"
              aria-pressed={winner === p.id}
              onClick={() => setWinner(p.id)}
            >
              {p.name}
            </button>
          ))}
          <button
            type="button"
            className="club-chip"
            aria-pressed={isDraw}
            onClick={() => setWinner('draw')}
          >
            {t('Draw (나가리)', '나가리 (무승부)')}
          </button>
        </div>
      </div>

      {isDraw && (
        <div className="mt-5">
          <p className="text-body">
            {t('Nobody wins, so no chips move.', '아무도 이기지 못했어요. 칩은 움직이지 않아요.')}{' '}
            {RULES.nagariDoubles &&
              t("The next hand's score counts double.", '다음 판 점수가 두 배가 돼요.')}
          </p>
          <div className="sticky bottom-0 -mx-5 mt-5 flex flex-wrap gap-3 bg-surface px-5 pb-1 pt-3 sm:-mx-6 sm:px-6">
            <button
              type="button"
              className="club-btn club-btn--primary text-body"
              onClick={onSaveDraw}
            >
              {t('Save the draw', '나가리 저장')}
            </button>
            <button type="button" className="club-btn text-body" onClick={onCancel}>
              {t('Cancel', '취소')}
            </button>
          </div>
        </div>
      )}

      {winnerId && input && calc && (
        <>
          <div className="mt-6 space-y-4">
            <Stepper
              label={t('Points', '점수')}
              hint={t(
                `Go/Stop from ${callThreshold(playerCount as Players)} points`,
                `${callThreshold(playerCount as Players)}점부터 고/스톱`,
              )}
              value={points}
              min={1}
              max={99}
              onChange={setPoints}
            />
            <Stepper label={t('Gos', '고')} value={gos} max={9} onChange={setGos} />
            <Stepper label={t('Shakes', '흔들기')} value={shakes} max={5} onChange={setShakes} />
            <Stepper label={t('Bombs', '폭탄')} value={bombs} max={5} onChange={setBombs} />
          </div>

          {(bakOn.length > 0 || goBakOn) && (
            <div className="mt-6 space-y-4">
              {losers.map((l) => (
                <fieldset key={l.id}>
                  <legend className={sectionTitle}>{t(`${l.name} lost`, `${l.name} 패`)}</legend>
                  {bakOn.map((r) => (
                    <Check
                      key={r.id}
                      checked={flagsOf(l.id)[r.id]}
                      onChange={(v) => setFlag(l.id, r.id, v)}
                    >
                      {BAK_LABEL[r.id][ko ? 'ko' : 'en']}
                      {ko ? ` (${BAK_LABEL[r.id].en})` : ` (${BAK_LABEL[r.id].ko})`}
                    </Check>
                  ))}
                  {goBakOn && (
                    <Check
                      checked={flagsOf(l.id).goBak}
                      onChange={(v) => setFlag(l.id, 'goBak', v)}
                    >
                      {t('Called Go, then lost (Go-bak)', '고를 부르고 졌어요 (고박)')}
                    </Check>
                  )}
                </fieldset>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-input bg-paper p-4" aria-live="polite">
            <div className={sectionTitle}>{t('The math', '계산')}</div>
            <ul className="space-y-2 text-label tabular-nums">
              {calc.losers.map((l) => (
                <li key={l.playerId}>
                  <span className="font-bold">{names[l.playerId]}</span>{' '}
                  {mathLine(input, calc, l, names, playerCount, ko)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-body font-bold tabular-nums">
              {t(
                `${names[winnerId]} takes ${calc.winnerGets} chips`,
                `${names[winnerId]}: +${calc.winnerGets}칩`,
              )}
            </p>
          </div>

          <div className="sticky bottom-0 -mx-5 mt-6 flex flex-wrap gap-3 bg-surface px-5 pb-1 pt-3 sm:-mx-6 sm:px-6">
            <button
              type="button"
              className="club-btn club-btn--primary text-body"
              onClick={() => onSaveHand(input)}
            >
              {t('Save hand', '판 저장')}
            </button>
            <button type="button" className="club-btn text-body" onClick={onCancel}>
              {t('Cancel', '취소')}
            </button>
          </div>
        </>
      )}

      {!winner && (
        <div className="mt-5">
          <button type="button" className="club-btn text-body" onClick={onCancel}>
            {t('Cancel', '취소')}
          </button>
        </div>
      )}
    </div>
  );
}
