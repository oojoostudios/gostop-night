import type { Metadata } from 'next';
import { HostHome } from '@/components/host-home';

export const metadata: Metadata = {
  title: 'Host',
  robots: { index: false, follow: false },
};

export default function HostPage() {
  return <HostHome />;
}
