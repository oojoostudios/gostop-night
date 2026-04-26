'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Variant = 'standard' | 'matgo' | 'minhwatu';

export const VARIANTS: ReadonlyArray<{
  id: Variant;
  label: string;
  labelKo: string;
  disabled?: boolean;
}> = [
  { id: 'standard', label: 'Go-Stop', labelKo: '고스톱' },
  { id: 'matgo', label: 'Matgo', labelKo: '맞고', disabled: true },
  { id: 'minhwatu', label: 'Minhwatu', labelKo: '민화투', disabled: true },
];

type VariantContextValue = {
  variant: Variant;
  setVariant: (variant: Variant) => void;
};

const VariantContext = createContext<VariantContextValue | undefined>(undefined);

export function VariantProvider({
  children,
  defaultVariant = 'standard',
}: {
  children: ReactNode;
  defaultVariant?: Variant;
}) {
  const [variant, setVariant] = useState<Variant>(defaultVariant);
  const value = useMemo(() => ({ variant, setVariant }), [variant]);
  return <VariantContext.Provider value={value}>{children}</VariantContext.Provider>;
}

export function useVariant() {
  const ctx = useContext(VariantContext);
  if (!ctx) throw new Error('useVariant must be used within a VariantProvider');
  return ctx;
}
