import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventByCode, toPublicEvent } from '@/lib/live/events';
import { isHostSession } from '@/lib/live/host-session';
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

  return <HostDashboard event={toPublicEvent(event)} />;
}
