'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Locale = 'en' | 'ko';

const STORAGE_KEY = 'gostop:locale';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ko';
}

export function LocaleProvider({
  children,
  defaultLocale = 'en',
}: {
  children: ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) setLocale(stored);
    } catch {
      // localStorage unavailable; keep default
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore quota/availability errors
    }
  }, [locale, hydrated]);

  // Screen readers and translation tools go by the page language, so keep it in step with the toggle.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}
