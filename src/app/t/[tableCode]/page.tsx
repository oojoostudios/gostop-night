import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/live/events';
import { getTableByCode, listPlayersForTable } from '@/lib/live/tables';
import { listHandsForTable } from '@/lib/live/hands';
import { signLiveToken } from '@/lib/live/token';
import { TableScreen } from '@/components/table-screen';

export const metadata: Metadata = {
  title: 'Table',
  robots: { index: false, follow: false },
};

export default async function TablePage({ params }: { params: Promise<{ tableCode: string }> }) {
  const { tableCode } = await params;
  const table = await getTableByCode(tableCode);
  if (!table) notFound();
  const event = await getEventById(table.event_id);
  if (!event) notFound();

  const [players, hands, accessToken] = await Promise.all([
    listPlayersForTable(table.id),
    listHandsForTable(table.id),
    signLiveToken({ gostop_role: 'player', event_id: event.id, table_id: table.id }, '12h'),
  ]);

  return (
    <TableScreen
      table={{ id: table.id, code: table.code, name: table.name }}
      event={{
        id: event.id,
        buyInDollars: event.buy_in_dollars,
        chipsPerBuyIn: event.chips_per_buy_in,
        chipsPerPoint: event.chips_per_point,
      }}
      initialPlayers={players}
      initialHands={hands}
      accessToken={accessToken}
    />
  );
}
