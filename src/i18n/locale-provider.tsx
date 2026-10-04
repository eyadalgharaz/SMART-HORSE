'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ar } from './dictionaries/ar';
import { en, type Dictionary } from './dictionaries/en';
import { defaultLocale, directionOf, isLocale, STORAGE_KEY, type Locale } from './locale';

const dictionaries: Record<Locale, Dictionary> = { en, ar };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: 'ltr' | 'rtl';
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Reads the saved language once on mount (client-only — `localStorage` isn't
 * available during server rendering, so the app renders English/LTR first
 * and switches immediately after hydration if Arabic was saved). Persists on
 * every change and keeps `<html dir lang>` in sync, which is what puts the
 * whole app into RTL rather than one page at a time.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dir = directionOf(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, dir: directionOf(locale) }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale/useTranslations must be used within a LocaleProvider');
  return context;
}

/** Current language, a setter, and the resolved text direction. */
export function useLocale() {
  return useLocaleContext();
}

/** The active locale's full, typed translation dictionary. */
export function useTranslations(): Dictionary {
  const { locale } = useLocaleContext();
  return dictionaries[locale];
}
