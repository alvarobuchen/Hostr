'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* ════════════════════════════════════════════════
   CENIT — Cookie consent (a lightweight CMP)
   Four categories:
     · necessary  — always on (auth, security, core)
     · functional — preferences (language, theme) → better UX
     · analytics  — anonymous usage metrics → improve the product
     · marketing  — advertising + data sharing with partners
                    (the "sell to other places" bucket; opt-in only)
   Consent is stored in a first-party cookie and broadcast via a
   `cenit:consent` window event so script loaders can react live.
════════════════════════════════════════════════ */

export type Category = 'necessary' | 'functional' | 'analytics' | 'marketing';
export type Consent = Record<Category, boolean>;

export const CONSENT_COOKIE = 'cenit_consent';
const CONSENT_VERSION = 1;
const ONE_YEAR = 60 * 60 * 24 * 365;

export const ALL_ON: Consent = { necessary: true, functional: true, analytics: true, marketing: true };
export const ESSENTIAL_ONLY: Consent = { necessary: true, functional: false, analytics: false, marketing: false };

type Stored = { v: number; ts: number; c: Omit<Consent, 'necessary'> };

export function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.slice(CONSENT_COOKIE.length + 1))) as Stored;
    if (parsed.v !== CONSENT_VERSION) return null;
    return { necessary: true, functional: !!parsed.c.functional, analytics: !!parsed.c.analytics, marketing: !!parsed.c.marketing };
  } catch {
    return null;
  }
}

function writeConsent(c: Consent) {
  const payload: Stored = { v: CONSENT_VERSION, ts: Date.now(), c: { functional: c.functional, analytics: c.analytics, marketing: c.marketing } };
  const value = encodeURIComponent(JSON.stringify(payload));
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent<Consent>('cenit:consent', { detail: c }));

  // Best-effort: log the decision to the backend so the owner can review consent
  // across all visitors (the cookie itself only ever lives in this one browser).
  void fetch('/api/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ functional: c.functional, analytics: c.analytics, marketing: c.marketing }),
    keepalive: true,
  }).catch(() => { /* logging is non-critical */ });
}

type Ctx = {
  /** Current consent, or null until the visitor has decided. */
  consent: Consent | null;
  /** True once the cookie has been read on the client (avoids hydration flash). */
  ready: boolean;
  /** Whether the preferences dialog is open. */
  prefsOpen: boolean;
  save: (c: Consent) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const CookieConsentContext = createContext<Ctx | null>(null);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    setConsent(existing);
    setReady(true);
    if (existing) window.dispatchEvent(new CustomEvent<Consent>('cenit:consent', { detail: existing }));
  }, []);

  const save = useCallback((c: Consent) => {
    writeConsent(c);
    setConsent(c);
    setPrefsOpen(false);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      consent,
      ready,
      prefsOpen,
      save,
      acceptAll: () => save(ALL_ON),
      rejectAll: () => save(ESSENTIAL_ONLY),
      openPreferences: () => setPrefsOpen(true),
      closePreferences: () => setPrefsOpen(false),
    }),
    [consent, ready, prefsOpen, save],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider');
  return ctx;
}

/** Imperatively open the preferences dialog from anywhere (e.g. a footer link). */
export function openCookiePreferences() {
  window.dispatchEvent(new Event('cenit:open-cookie-prefs'));
}
