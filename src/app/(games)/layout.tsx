import type { ReactNode } from "react";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Sidebar } from "@/components/sidebar";

export default function GamesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MobileTopbar />
      <Sidebar />
      {/* main is full-viewport-width — sections handle their own bg + content offset.
       * The sidebar is fixed (w-72) and visually occupies the left 288px on lg+ screens,
       * but doesn't take any layout space. Section content uses `lg:ml-72` internally
       * to clear it. */}
      <main className="min-h-screen">{children}</main>
    </>
  );
}
