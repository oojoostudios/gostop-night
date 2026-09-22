import type { ReactNode } from 'react';
import { LiveTopbar } from '@/components/live-topbar';

/**
 * Stage 2's host screens aren't part of the guide, so they skip the guide's sidebar layout
 * — see src/app/(games)/layout.tsx for that one.
 */
export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LiveTopbar />
      <main className="min-h-screen">{children}</main>
    </>
  );
}
