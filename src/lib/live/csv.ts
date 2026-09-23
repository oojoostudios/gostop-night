const cell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export type SummaryRow = {
  name: string;
  tableName: string;
  buyIns: number;
  chips: number;
  net: number;
  dollars: number;
  netDollars: number;
};

/** The whole event's end-of-night summary as CSV text, one row per player across every table. */
export function eventSummaryToCsv(rows: SummaryRow[], ko: boolean): string {
  const t = (en: string, kr: string) => (ko ? kr : en);
  const header = [
    t('Player', '플레이어'),
    t('Table', '테이블'),
    t('Buy-ins', '바이인 횟수'),
    t('Final chips', '최종 칩'),
    t('Net chips', '순 칩'),
    t('Final value ($)', '최종 가치($)'),
    t('Net ($)', '순 손익($)'),
  ];
  const body = rows.map((r) => [
    r.name,
    r.tableName,
    r.buyIns,
    r.chips,
    r.net,
    r.dollars.toFixed(2),
    r.netDollars.toFixed(2),
  ]);
  // The leading BOM lets Excel read Korean names correctly (matches src/lib/tonight.ts eventToCsv).
  return '﻿' + [header, ...body].map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

export function downloadEventSummaryCsv(
  eventName: string,
  date: string,
  rows: SummaryRow[],
  ko: boolean,
) {
  const blob = new Blob([eventSummaryToCsv(rows, ko)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const slug =
    eventName
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '') || 'game-night';
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-${date}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
