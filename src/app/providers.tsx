'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { I18nProvider } from '@/lib/i18n';
import { CookieConsentProvider } from '@/lib/cookie-consent';
import { CookieBanner } from '@/components/cookie-banner';
import { ConsentScripts } from '@/components/consent-scripts';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <I18nProvider>
        <CookieConsentProvider>
          {children}
          <CookieBanner />
          <ConsentScripts />
        </CookieConsentProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
