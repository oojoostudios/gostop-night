'use client';

import { useActionState, useState } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { chipValueText } from '@/lib/tonight';
import { createEventAction, type CreateEventState } from '@/app/host/actions';

const initialState: CreateEventState = { error: null };

const todayLocal = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const ERROR_TEXT: Record<NonNullable<CreateEventState['error']>, [string, string]> = {
  'date-required': ['Pick a date.', '날짜를 선택하세요.'],
  'buy-in-invalid': ['Buy-in must be more than $0.', '바이인은 0보다 커야 해요.'],
  'chips-invalid': ['Chips must be whole numbers, 1 or more.', '칩 수는 1 이상의 정수여야 해요.'],
  'pin-invalid': ['PIN must be 4–6 digits.', 'PIN은 숫자 4~6자리여야 해요.'],
  'pin-mismatch': ["The two PINs don't match.", '입력한 PIN이 서로 달라요.'],
};

export function CreateEventForm() {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const [state, action, pending] = useActionState(createEventAction, initialState);

  const [buyIn, setBuyIn] = useState('10');
  const [chipsPerBuyIn, setChipsPerBuyIn] = useState('100');
  const buyInN = Number(buyIn);
  const chipsN = Number(chipsPerBuyIn);
  const chipPreview =
    Number.isFinite(buyInN) && buyInN > 0 && Number.isInteger(chipsN) && chipsN >= 1
      ? chipValueText(buyInN / chipsN)
      : null;

  const label = 'mb-1.5 block text-label font-medium';
  const input = 'club-input !bg-paper w-full';
  const heading = 'mb-3 text-label font-bold uppercase tracking-[0.18em] text-ink-soft';

  return (
    <form action={action} className="club-card space-y-8 p-5 sm:p-6">
      <div>
        <div className={heading}>{t('Event', '이벤트')}</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>{t('Event name', '이벤트 이름')}</span>
            <input
              className={input}
              name="name"
              maxLength={40}
              placeholder={t('Game night', '게임 나이트')}
            />
          </label>
          <label className="block">
            <span className={label}>{t('Date', '날짜')}</span>
            <input className={input} name="date" type="date" defaultValue={todayLocal()} required />
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
              name="buyIn"
              inputMode="decimal"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={label}>{t('Chips per buy-in', '바이인당 칩')}</span>
            <input
              className={input}
              name="chipsPerBuyIn"
              inputMode="numeric"
              value={chipsPerBuyIn}
              onChange={(e) => setChipsPerBuyIn(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={label}>{t('Chips per point', '점당 칩')}</span>
            <input className={input} name="chipsPerPoint" inputMode="numeric" defaultValue="1" />
          </label>
        </div>
        <p className="mt-3 text-body tabular-nums text-ink-soft" aria-live="polite">
          {chipPreview
            ? t(`1 chip = ${chipPreview}`, `칩 1개 = ${chipPreview}`)
            : t(
                'Enter a buy-in above $0 and whole numbers of chips.',
                '바이인은 0보다 크게, 칩은 정수로 입력하세요.',
              )}
        </p>
      </div>

      <div>
        <div className={heading}>{t('Host PIN', '호스트 PIN')}</div>
        <p className="mb-3 text-body text-ink-soft">
          {t(
            "You'll need this PIN for host actions all night — rebuys, moves, edits. Players never see it.",
            '오늘 밤 내내 호스트 작업(리바이, 이동, 수정)에 이 PIN이 필요해요. 플레이어에게는 보이지 않아요.',
          )}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>{t('4–6 digit PIN', '4~6자리 PIN')}</span>
            <input
              className={`${input} text-center tracking-[0.3em]`}
              name="pin"
              type="text"
              inputMode="numeric"
              pattern="\d{4,6}"
              maxLength={6}
              required
            />
          </label>
          <label className="block">
            <span className={label}>{t('Confirm PIN', 'PIN 확인')}</span>
            <input
              className={`${input} text-center tracking-[0.3em]`}
              name="confirmPin"
              type="text"
              inputMode="numeric"
              pattern="\d{4,6}"
              maxLength={6}
              required
            />
          </label>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-body text-plum">
          {t(...ERROR_TEXT[state.error])}
        </p>
      )}

      <button
        type="submit"
        className="club-btn club-btn--primary w-full text-body disabled:cursor-not-allowed disabled:opacity-40"
        disabled={pending}
      >
        {pending ? t('Creating…', '만드는 중…') : t('Create event', '이벤트 만들기')}
      </button>
    </form>
  );
}
