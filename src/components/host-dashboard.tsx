'use client';

import { useLocale } from '@/contexts/locale-context';
import { chipValue, chipValueText, money, signedMoney } from '@/lib/tonight';
import { liveStandings } from '@/lib/live/standings';
import type { PublicEvent } from '@/lib/live/events';
import type { PlayerRow, TableRow } from '@/lib/live/types';
import { CreateTableForm } from '@/components/create-table-form';
import { AddPlayerForm } from '@/components/add-player-form';

export type TableWithQr = { table: TableRow; qrDataUrl: string };

export function HostDashboard({
  event,
  tables,
  players,
}: {
  event: PublicEvent;
  tables: TableWithQr[];
  players: PlayerRow[];
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const chipVal = chipValue({ buyIn: event.buy_in_dollars, chipsPerBuyIn: event.chips_per_buy_in });
  const chipValueLabel = chipValueText(chipVal);

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
          <dd className="text-right tabular-nums">{money(event.buy_in_dollars)}</dd>
          <dt className="text-ink-soft">{t('Chips per buy-in', '바이인당 칩')}</dt>
          <dd className="text-right tabular-nums">{event.chips_per_buy_in}</dd>
          <dt className="text-ink-soft">{t('Chips per point', '점당 칩')}</dt>
          <dd className="text-right tabular-nums">{event.chips_per_point}</dd>
          <dt className="text-ink-soft">{t('1 chip is worth', '칩 1개 가치')}</dt>
          <dd className="text-right tabular-nums">{chipValueLabel}</dd>
        </dl>
      </div>

      <div className="club-card mt-6 space-y-5 p-5 sm:p-6">
        <h2 className="text-sub font-display">{t('Tables', '테이블')}</h2>

        {tables.length === 0 ? (
          <p className="text-body text-ink-soft">
            {t('No tables yet — add one below.', '아직 테이블이 없어요 — 아래에서 추가하세요.')}
          </p>
        ) : (
          <div className="space-y-5">
            {tables.map(({ table, qrDataUrl }) => {
              const atThisTable = players.filter((p) => p.table_id === table.id);
              const rows = liveStandings(atThisTable, event.chips_per_buy_in, chipVal);
              return (
                <div key={table.id} className="rounded-input bg-paper p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-sub">{table.name}</div>
                      <div
                        className="text-label tabular-nums text-ink-soft"
                        data-testid="table-code"
                      >
                        {table.code}
                      </div>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt={t(`QR code for ${table.name}`, `${table.name} QR 코드`)}
                      width={96}
                      height={96}
                      className="rounded-input"
                    />
                  </div>

                  {rows.length === 0 ? (
                    <p className="mt-3 text-body text-ink-soft">
                      {t('No players yet.', '아직 플레이어가 없어요.')}
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-1.5 text-body tabular-nums">
                      {rows.map((r) => (
                        <li key={r.player.id} className="flex items-center justify-between gap-3">
                          <span className="truncate">{r.player.name}</span>
                          <span className="text-ink-soft">
                            {r.player.chips} {t('chips', '칩')} · {signedMoney(r.netDollars)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-hairline pt-5">
          <CreateTableForm eventCode={event.code} />
        </div>
      </div>

      <div className="club-card mt-6 space-y-5 p-5 sm:p-6">
        <h2 className="text-sub font-display">{t('Add a player', '플레이어 추가')}</h2>
        <AddPlayerForm eventCode={event.code} tables={tables.map((t) => t.table)} />
      </div>
    </div>
  );
}
