'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { BalanceCheck } from '@/components/tonight-table';
import {
  chipValue,
  chipValueText,
  eventToCsv,
  money,
  signed,
  signedMoney,
  standings,
  type TonightEvent,
} from '@/lib/tonight';

/** Saves the night as a .csv file the phone can open in a spreadsheet. */
export function downloadCsv(ev: TonightEvent, ko: boolean) {
  const blob = new Blob([eventToCsv(ev, ko)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const slug =
    ev.name
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '') || 'game-night';
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-${ev.date}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Final chips and dollar value per player. Used for tonight's cash-out and for past events. */
export function CashOutView({
  ev,
  readOnly = false,
  onBack,
  onFinish,
}: {
  ev: TonightEvent;
  /** A finished night: no finishing, and "back" goes to the list. */
  readOnly?: boolean;
  onBack: () => void;
  onFinish?: () => void;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const rows = standings(ev);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-6">
      <div className="club-card p-5 sm:p-6">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
          {readOnly ? t('Past event', '지난 게임') : t('Cash-out', '정산')}
        </div>
        <h3 className="mt-1 font-display text-2xl leading-tight">{ev.name}</h3>
        <p className="mt-1 text-sm text-ink-soft tabular-nums">
          {ev.date} · {t('1 chip', '칩 1개')} = {chipValueText(chipValue(ev))}
        </p>

        <ul className="mt-5 divide-y divide-hairline" data-testid="cashout-rows">
          {rows.map((r) => (
            <li
              key={r.player.id}
              className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-4"
            >
              <div className="min-w-0">
                <div className="truncate font-display text-xl">{r.player.name}</div>
                <div className="text-xs tabular-nums text-ink-soft">
                  {t(
                    `${r.buyIns} × ${ev.chipsPerBuyIn} chips bought`,
                    `바이인 ${r.buyIns}회 × ${ev.chipsPerBuyIn}칩`,
                  )}
                </div>
              </div>
              <div className="tabular-nums sm:text-right">
                <div className="text-2xl font-bold">
                  {r.chips}{' '}
                  <span className="text-sm font-normal text-ink-soft">{t('chips', '칩')}</span>
                </div>
                <div className="text-base">
                  {money(r.dollars)}{' '}
                  <span className="text-ink-soft">
                    ({signed(r.net)} {t('chips', '칩')} · {signedMoney(r.netDollars)})
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-hairline pt-4">
          <BalanceCheck ev={ev} />
        </div>
        <p className="mt-4 text-base font-medium">
          {t(
            'Chips are tracked here — settle up in person.',
            '칩은 여기서 기록만 해요 — 정산은 직접 만나서 하세요.',
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="club-btn text-base" onClick={() => downloadCsv(ev, ko)}>
          <Download className="size-4" />
          {t('Export CSV', 'CSV 내보내기')}
        </button>
        <button type="button" className="club-btn text-base" onClick={onBack}>
          {readOnly
            ? t('Back to past events', '지난 게임 목록')
            : t('Back to the table', '테이블로 돌아가기')}
        </button>
        {!readOnly &&
          onFinish &&
          (confirming ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base">
                {t('Save this night to past events?', '이 게임을 지난 게임에 저장할까요?')}
              </span>
              <button
                type="button"
                className="club-btn club-btn--primary text-base"
                onClick={onFinish}
              >
                {t('Yes, finish', '네, 마칠게요')}
              </button>
              <button
                type="button"
                className="club-btn text-base"
                onClick={() => setConfirming(false)}
              >
                {t('Not yet', '아직이요')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="club-btn club-btn--primary text-base"
              onClick={() => setConfirming(true)}
            >
              {t('Finish event', '이벤트 마치기')}
            </button>
          ))}
      </div>
    </div>
  );
}
