'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

/* ════════════════════════════════════════════════
   CENIT — Social sign-in (Firebase Auth)
   Google is enabled. Apple is scaffolded but hidden until a paid Apple
   Developer account is configured — flip APPLE_ENABLED to show it.
════════════════════════════════════════════════ */

const APPLE_ENABLED = false;

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden>
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M10.94 8.5c.02 2.02 1.77 2.69 1.79 2.7-.01.05-.28.96-.92 1.9-.55.81-1.13 1.62-2.04 1.64-.9.02-1.18-.53-2.2-.53-1.03 0-1.34.51-2.19.55-.88.03-1.55-.88-2.11-1.69-1.14-1.65-2.01-4.67-.84-6.71.58-1.01 1.62-1.65 2.75-1.67.86-.02 1.68.58 2.21.58.53 0 1.52-.72 2.56-.61.44.02 1.66.18 2.45 1.34-.06.04-1.46.85-1.44 2.54zM9.3 3.3c.47-.57.79-1.36.7-2.15-.68.03-1.5.45-1.98 1.02-.43.5-.81 1.31-.71 2.08.76.06 1.53-.39 1.99-.95z" />
  </svg>
);

/** Turn a Firebase Auth error code into something actionable. */
function messageForCode(code: string): string {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'This domain isn’t authorized for sign-in. Add it in Firebase → Authentication → Settings → Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in isn’t enabled. Turn it on in Firebase → Authentication → Sign-in method.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.';
    case 'auth/network-request-failed':
      return 'Network error reaching Firebase. Check your connection and try again.';
    default:
      return `Could not sign in${code ? ` (${code})` : ''}. Please try again.`;
  }
}

const btn =
  'inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--line)] bg-white py-3 text-sm font-medium text-[var(--ink-1)] transition hover:bg-[var(--bg-2)] hover:border-[var(--line-2)] disabled:opacity-50';

export function SocialAuth({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState('');

  const run = async (which: 'google' | 'apple') => {
    setLoading(which);
    setError('');
    try {
      await (which === 'google' ? signInWithGoogle() : signInWithApple());
      router.push(callbackUrl);
    } catch (e) {
      const code = (e as { code?: string })?.code || '';
      // User dismissed the popup — not an error worth showing.
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Social sign-in failed:', code, e);
      setError(messageForCode(code));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 rule" />
        <span className="text-xs text-[var(--ink-3)]">or continue with</span>
        <div className="flex-1 rule" />
      </div>
      {error && <p className="alert-err mb-3">{error}</p>}
      <div className="space-y-2.5">
        <button type="button" onClick={() => run('google')} disabled={loading !== null} className={btn}>
          <GoogleIcon />
          {loading === 'google' ? 'Opening…' : 'Continue with Google'}
        </button>
        {APPLE_ENABLED && (
          <button type="button" onClick={() => run('apple')} disabled={loading !== null} className={btn}>
            <AppleIcon />
            {loading === 'apple' ? 'Opening…' : 'Continue with Apple'}
          </button>
        )}
      </div>
    </div>
  );
}

export default SocialAuth;
