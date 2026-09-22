import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventByCode, toPublicEvent } from '@/lib/live/events';
import { isHostSession } from '@/lib/live/host-session';
import { listPlayersForEvent, listTablesForEvent } from '@/lib/live/tables';
import { tableQrDataUrl } from '@/lib/live/qrcode';
import { siteUrl } from '@/lib/live/site-url';
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
  const tablesWithQr = await Promise.all(
    tables.map(async (table) => ({
      table,
      qrDataUrl: await tableQrDataUrl(`${siteUrl()}/t/${table.code}`),
    })),
  );

  return <HostDashboard event={toPublicEvent(event)} tables={tablesWithQr} players={players} />;
}
