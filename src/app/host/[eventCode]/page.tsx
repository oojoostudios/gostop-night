import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventByCode, toPublicEvent } from '@/lib/live/events';
import { isHostSession } from '@/lib/live/host-session';
import { listPlayersForEvent, listTablesForEvent } from '@/lib/live/tables';
import { listHandsForTables } from '@/lib/live/hands';
import { listPendingHandsForTables } from '@/lib/live/pending-hands';
import { tableQrDataUrl } from '@/lib/live/qrcode';
import { siteUrl } from '@/lib/live/site-url';
import { signLiveToken } from '@/lib/live/token';
import { HostPinGate } from '@/components/host-pin-gate';
import { HostDashboard } from '@/components/host-dashboard';

export const metadata: Metadata = {
  title: 'Host',
  robots: { index: false, follow: false },
};

export default async function HostEventPage({
  params,
}: {
  params: Promise<{ eventCode: string }>;
}) {
  const { eventCode } = await params;
  const event = await getEventByCode(eventCode);
  if (!event) notFound();

  if (!(await isHostSession(event.code, event.id))) {
    return <HostPinGate eventCode={event.code} />;
  }

  const [tables, players] = await Promise.all([
    listTablesForEvent(event.id),
    listPlayersForEvent(event.id),
  ]);
  const tableIds = tables.map((table) => table.id);
  const [hands, pendingHands, hostToken] = await Promise.all([
    listHandsForTables(tableIds),
    listPendingHandsForTables(tableIds),
    signLiveToken({ gostop_role: 'host', event_id: event.id }, '12h'),
  ]);
  const tablesWithQr = await Promise.all(
    tables.map(async (table) => ({
      table,
      qrDataUrl: await tableQrDataUrl(`${siteUrl()}/t/${table.code}`),
    })),
  );

  return (
    <HostDashboard
      event={toPublicEvent(event)}
      initialTables={tablesWithQr}
      initialPlayers={players}
      initialHands={hands}
      initialPendingHands={pendingHands}
      accessToken={hostToken}
    />
  );
}
