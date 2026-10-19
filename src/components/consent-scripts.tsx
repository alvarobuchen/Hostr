'use client';

import Script from 'next/script';
import { useCookieConsent } from '@/lib/cookie-consent';

/* ════════════════════════════════════════════════
   CENIT — Consent-gated third-party scripts
   Nothing here loads until the matching consent is granted:
     · analytics → Google Analytics (NEXT_PUBLIC_GA_ID)
     · marketing → ad / data-sharing partner tag (NEXT_PUBLIC_ADS_SRC)
   IDs are env-driven, so this is a no-op until you set them — but the
   consent gating is always enforced. Marketing tags can also read the
   `window.cenitConsent.marketing` flag to decide whether to fire.
════════════════════════════════════════════════ */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADS_SRC = process.env.NEXT_PUBLIC_ADS_SRC;

export function ConsentScripts() {
  const { consent } = useCookieConsent();
  if (!consent) return null;

  // Expose a tiny global for partner tags / inline checks.
  if (typeof window !== 'undefined') {
    (window as unknown as { cenitConsent?: typeof consent }).cenitConsent = consent;
  }

  return (
    <>
      {consent.analytics && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="cenit-ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {consent.marketing && ADS_SRC && (
        <Script src={ADS_SRC} strategy="afterInteractive" />
      )}
    </>
  );
}

export default ConsentScripts;
