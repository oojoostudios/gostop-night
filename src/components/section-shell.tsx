import type { ReactNode } from "react";

/**
 * SectionShell — full-bleed section wrapper.
 *
 * Why this exists: `(games)/layout.tsx` deliberately leaves <main> at viewport
 * full width so each section can paint its own bg edge-to-edge. The sidebar
 * (fixed, lg+ only) sits ON TOP of the left 288px with its own opaque bg.
 *
 * Each section needs:
 *   1. Full-width <section> (so its bg fills the visible main area)
 *   2. Inner content offset by `lg:ml-72` (clear the sidebar)
 *   3. Inner content centered with `max-w-5xl mx-auto px-8 lg:px-16` (mahjong tone)
 *
 * Usage:
 *   <SectionShell id="section-cards" className="section-cards-bg">
 *     ...content...
 *   </SectionShell>
 */
export function SectionShell({
  id,
  className,
  innerClassName,
  children,
  bordered = true,
}: {
  id?: string;
  /** Outer <section> classes — bg, py, etc. */
  className?: string;
  /** Inner content container classes — extra padding/spacing if needed. */
  innerClassName?: string;
  children: ReactNode;
  /** Top border separator — true for guide sections. */
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={`relative ${
        bordered ? "border-t border-foreground/10" : ""
      } ${className ?? ""}`.trim()}
    >
      <div className="lg:ml-72">
        <div
          className={`max-w-5xl mx-auto px-6 sm:px-8 lg:px-16 ${
            innerClassName ?? ""
          }`.trim()}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
