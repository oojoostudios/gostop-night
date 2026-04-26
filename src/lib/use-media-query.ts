"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 *
 * SSR-safe: returns `false` on the server and during hydration's first paint
 * (avoids markup mismatch). Real value is set on mount.
 *
 * @example
 *   const isMobile = useMediaQuery("(max-width: 1023px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Tailwind's `lg` breakpoint is 1024px — anything narrower is mobile/tablet. */
export const useIsMobile = () => useMediaQuery("(max-width: 1023px)");
