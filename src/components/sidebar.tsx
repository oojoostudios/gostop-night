"use client";

import { NavContent } from "@/components/nav-content";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-8 fixed top-0 left-0 h-screen w-72 border-r border-foreground/10 p-8 overflow-y-auto bg-background">
      <NavContent />
    </aside>
  );
}
