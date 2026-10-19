import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
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
  toggle: () => void;
  t: (key: string, vars?: Vars) => string;
  ta: (key: string) => string[];
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const value = useMemo<I18nContextValue>(() => {
    const messages = messagesByLocale[locale];
    const fallback = messagesByLocale.en;
    return {
      locale,
      setLocale,
      toggle: () => setLocale((l) => (l === 'en' ? 'es' : 'en')),
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
