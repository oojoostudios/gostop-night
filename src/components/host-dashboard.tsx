'use client';

import { useLocale } from '@/contexts/locale-context';
import { chipValueText } from '@/lib/tonight';
import type { PublicEvent } from '@/lib/live/events';

export function HostDashboard({ event }: { event: PublicEvent }) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const chipValue = chipValueText(event.buy_in_dollars / event.chips_per_buy_in);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-title">{event.name}</h1>
        <span className="text-label tabular-nums text-ink-soft">{event.date}</span>
      </div>
      <p className="mt-1 text-label uppercase tracking-[0.18em] text-ink-soft">
        {t('Host', '호스트')} · {event.code}
      </p>

      <div className="club-card mt-8 space-y-3 p-5 sm:p-6">
        <h2 className="text-sub font-display">{t('Event settings', '이벤트 설정')}</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-body">
          <dt className="text-ink-soft">{t('Buy-in', '바이인')}</dt>
          <dd className="text-right tabular-nums">${event.buy_in_dollars.toFixed(2)}</dd>
          <dt className="text-ink-soft">{t('Chips per buy-in', '바이인당 칩')}</dt>
          <dd className="text-right tabular-nums">{event.chips_per_buy_in}</dd>
          <dt className="text-ink-soft">{t('Chips per point', '점당 칩')}</dt>
          <dd className="text-right tabular-nums">{event.chips_per_point}</dd>
          <dt className="text-ink-soft">{t('1 chip is worth', '칩 1개 가치')}</dt>
          <dd className="text-right tabular-nums">{chipValue}</dd>
        </dl>
      </div>

      <p className="mt-8 text-body text-ink-soft">
        {t(
          'Saved — this is the event you just created. Tables, QR codes and players are next.',
          '저장 완료 — 방금 만든 이벤트예요. 테이블, QR 코드, 플레이어 추가는 다음 단계예요.',
        )}
      </p>
    </div>
  );
}
