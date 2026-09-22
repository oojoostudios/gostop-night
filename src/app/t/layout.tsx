import type { ReactNode } from 'react';
import { LiveTopbar } from '@/components/live-topbar';

/** The player table screen, like /host, skips the guide's sidebar layout. */
export default function TableLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LiveTopbar />
      <main className="min-h-screen">{children}</main>
    </>
  );
}
