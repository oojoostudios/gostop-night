import type { ReactNode } from "react";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Sidebar } from "@/components/sidebar";

export default function GamesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MobileTopbar />
      <Sidebar />
      <main className="lg:ml-72 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 lg:px-16">{children}</div>
      </main>
    </>
  );
}
