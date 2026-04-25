"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Variant = "standard" | "matgo" | "minhwatu";

export const VARIANTS: ReadonlyArray<{
  id: Variant;
  label: string;
  labelKo: string;
}> = [
  { id: "standard", label: "Go-Stop", labelKo: "고스톱" },
  { id: "matgo", label: "Matgo", labelKo: "맞고" },
  { id: "minhwatu", label: "Minhwatu", labelKo: "민화투" },
];

type VariantContextValue = {
  variant: Variant;
  setVariant: (variant: Variant) => void;
};

const VariantContext = createContext<VariantContextValue | undefined>(undefined);

export function VariantProvider({
  children,
  defaultVariant = "standard",
}: {
  children: ReactNode;
  defaultVariant?: Variant;
}) {
  const [variant, setVariant] = useState<Variant>(defaultVariant);
  return (
    <VariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </VariantContext.Provider>
  );
}

export function useVariant() {
  const ctx = useContext(VariantContext);
  if (!ctx) throw new Error("useVariant must be used within a VariantProvider");
  return ctx;
}
