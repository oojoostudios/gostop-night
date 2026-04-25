"use client";

import type { ReactNode } from "react";
import { LocaleProvider } from "@/contexts/locale-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { VariantProvider } from "@/contexts/variant-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <VariantProvider>{children}</VariantProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
