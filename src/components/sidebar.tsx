"use client";

import { NavContent } from "@/components/nav-content";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed top-0 left-0 z-40 h-screen w-72 border-r border-foreground/10 overflow-y-auto bg-background">
      {/* my-auto centers the content vertically; w-full makes children stretch.
       * Using a wrapper (vs `justify-center` on aside) avoids the flexbox quirk
       * where centered content gets clipped if it overflows. */}
      <div className="my-auto w-full flex flex-col gap-7 px-7 py-10">
        <NavContent />
      </div>
    </aside>
  );
}
