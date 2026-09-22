'use client';

import { useState } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { chipValueText, newId, type TonightEvent } from '@/lib/tonight';

const parse = (s: string) => Number(s.trim().replace(',', '.'));
const todayLocal = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Setting up the night: name, date, buy-in, chips, and who is at this table. */
export function SetupView({
  onStart,
  onCancel,
}: {
  onStart: (ev: TonightEvent) => void;
  onCancel: () => void;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);

  const [name, setName] = useState('');
  const [date, setDate] = useState(todayLocal);
  const [buyIn, setBuyIn] = useState('10');
  const [chipsPerBuyIn, setChipsPerBuyIn] = useState('100');
  const [chipsPerPoint, setChipsPerPoint] = useState('1');
  const [count, setCount] = useState<2 | 3>(3);
  const [names, setNames] = useState(['', '', '']);

  const buyInN = parse(buyIn);
  const chipsN = parse(chipsPerBuyIn);
  const perPointN = parse(chipsPerPoint);
  const valid =
    Number.isFinite(buyInN) &&
    buyInN > 0 &&
    Number.isInteger(chipsN) &&
    chipsN >= 1 &&
    Number.isInteger(perPointN) &&
    perPointN >= 1 &&
    date !== '';

  const start = () => {
    if (!valid) return;
    onStart({
      id: newId(),
      name: name.trim() || t('Game night', '게임 나이트'),
      date,
      buyIn: buyInN,
      chipsPerBuyIn: chipsN,
      chipsPerPoint: perPointN,
      players: names.slice(0, count).map((n, i) => ({
        id: newId() + i,
        name: n.trim() || t(`Player ${i + 1}`, `플레이어 ${i + 1}`),
      })),
      log: [],
    });
  };

  const label = 'mb-1.5 block text-label font-medium';
  const input = 'club-input !bg-paper w-full';
  const heading = 'mb-3 text-label font-bold uppercase tracking-[0.18em] text-ink-soft';

  return (
    <form
      className="club-card space-y-8 p-5 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        start();
      }}
    >
      <h3 className="font-display text-sub">{t('Set up the night', '오늘 밤 준비')}</h3>

      <div>
        <div className={heading}>{t('Event', '이벤트')}</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>{t('Event name', '이벤트 이름')}</span>
            <input
              className={input}
              value={name}
              maxLength={40}
              placeholder={t('Game night', '게임 나이트')}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={label}>{t('Date', '날짜')}</span>
            <input
              className={input}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div>
        <div className={heading}>{t('Chips', '칩')}</div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={label}>{t('Buy-in ($)', '바이인 ($)')}</span>
            <input
              className={input}
              inputMode="decimal"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              aria-invalid={!(buyInN > 0)}
            />
          </label>
          <label className="block">
            <span className={label}>{t('Chips per buy-in', '바이인당 칩')}</span>
            <input
              className={input}
              inputMode="numeric"
              value={chipsPerBuyIn}
              onChange={(e) => setChipsPerBuyIn(e.target.value)}
              aria-invalid={!(Number.isInteger(chipsN) && chipsN >= 1)}
            />
          </label>
          <label className="block">
            <span className={label}>{t('Chips per point', '점당 칩')}</span>
            <input
              className={input}
              inputMode="numeric"
              value={chipsPerPoint}
              onChange={(e) => setChipsPerPoint(e.target.value)}
              aria-invalid={!(Number.isInteger(perPointN) && perPointN >= 1)}
            />
          </label>
        </div>
        <p className="mt-3 text-body tabular-nums" aria-live="polite">
          {valid
            ? t(
                `1 chip = ${chipValueText(buyInN / chipsN)}`,
                `칩 1개 = ${chipValueText(buyInN / chipsN)}`,
              )
            : t(
                'Enter a buy-in above 0 and whole numbers of chips.',
                '바이인은 0보다 크게, 칩은 정수로 입력하세요.',
              )}
        </p>
      </div>

      <div>
        <div className={heading}>{t('Players at this table', '이 테이블의 플레이어')}</div>
        <div className="mb-4 flex gap-2" role="group" aria-label={t('Number of players', '인원')}>
          {([2, 3] as const).map((n) => (
            <button
              key={n}
              type="button"
              className="club-chip"
              aria-pressed={count === n}
              onClick={() => setCount(n)}
            >
              {ko ? `${n}인` : `${n} players`}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {names.slice(0, count).map((n, i) => (
            <label key={i} className="block">
              <span className={label}>{t(`Player ${i + 1}`, `플레이어 ${i + 1}`)}</span>
              <input
                className={input}
                value={n}
                maxLength={20}
                placeholder={t(`Player ${i + 1}`, `플레이어 ${i + 1}`)}
                onChange={(e) =>
                  setNames((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))
                }
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="club-btn club-btn--primary text-body disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!valid}
        >
          {t('Start the game', '게임 시작')}
        </button>
        <button type="button" className="club-btn text-body" onClick={onCancel}>
          {t('Cancel', '취소')}
        </button>
      </div>
    </form>
  );
}
