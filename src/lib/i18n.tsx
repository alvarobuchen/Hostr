'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { messagesByLocale, type Locale } from '@/lib/messages';

export type { Locale };

type Vars = Record<string, string | number>;

function fill(template: string, vars?: Vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** Translate a key to a string, with optional {token} interpolation. */
  t: (key: string, vars?: Vars) => string;
  /** Translate a key whose value is a list of strings. */
  ta: (key: string) => string[];
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = window.localStorage.getItem('locale');
    return saved === 'es' || saved === 'en' ? saved : 'en';
  });

  // Keep <html lang> in sync (also on first mount, for the saved locale).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('locale', next);
      document.documentElement.lang = next;
    }
  };

  const value = useMemo<I18nContextValue>(() => {
    const messages = messagesByLocale[locale];
    const fallback = messagesByLocale.en;
    return {
      locale,
      setLocale,
      t: (key, vars) => {
        const raw = messages[key] ?? fallback[key] ?? key;
        const str = Array.isArray(raw) ? raw.join(' ') : raw;
        return fill(str, vars);
      },
      ta: (key) => {
        const raw = messages[key] ?? fallback[key];
        return Array.isArray(raw) ? raw : [];
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
