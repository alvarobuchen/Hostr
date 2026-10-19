'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { authErrorMessage } from '@/lib/auth-errors';

const validatePassword = (pw: string) => {
  const e: string[] = [];
  if (pw.length < 8) e.push('At least 8 characters');
  if (!/[A-Z]/.test(pw)) e.push('One uppercase letter');
  if (!/[a-z]/.test(pw)) e.push('One lowercase letter');
  if (!/[0-9]/.test(pw)) e.push('One number');
  return e;
};

const providerLabel: Record<string, string> = {
  'password': 'Email & password',
  'google.com': 'Google',
  'apple.com': 'Apple',
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, linkPassword, signOut } = useAuth();

  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Not signed in → go to login.
  useEffect(() => {
    if (!loading && !user) router.replace('/login?callbackUrl=/account');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="wrap page">
        <div className="mx-auto max-w-md h-40 card animate-pulse bg-[var(--bg-2)]" />
      </div>
    );
  }

  const hasPassword = user.providers.includes('password');
  const pwErrors = validatePassword(password);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwErrors.length) { setError('Please fix the password requirements.'); return; }
    setBusy(true); setError('');
    try {
      await linkPassword(password);
      setDone(true);
      setPassword('');
    } catch (err) {
      setError(authErrorMessage(err, 'Could not set the password. Try signing in again first.'));
    } finally { setBusy(false); }
  };

  return (
    <div className="wrap page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-md space-y-5"
      >
        <div>
          <p className="t-label-amber mb-2">Account</p>
          <h1 className="t-title">{user.name || 'Your account'}</h1>
          <p className="mt-2 t-body">{user.email}</p>
        </div>

        {/* Sign-in methods */}
        <div className="card card-p space-y-3">
          <p className="text-sm font-semibold text-[var(--ink-1)]">Sign-in methods</p>
          <div className="flex flex-wrap gap-2">
            {user.providers.map((p) => (
              <span key={p} className="badge badge-amber">{providerLabel[p] || p}</span>
            ))}
          </div>
        </div>

        {/* Set a password (only when the account has none yet) */}
        <div className="card card-p space-y-4">
          <div>
            <p className="text-sm font-semibold text-[var(--ink-1)]">
              {hasPassword ? 'Password' : 'Set a password'}
            </p>
            <p className="mt-1 text-sm text-[var(--ink-2)]">
              {hasPassword
                ? 'This account can already sign in with email & password.'
                : 'Add a password so you can also sign in with your email — not just Google.'}
            </p>
          </div>

          {hasPassword ? (
            <p className="alert-ok">✓ Email &amp; password is enabled for {user.email}.</p>
          ) : done ? (
            <p className="alert-ok">✓ Password set. You can now sign in with {user.email} and your password.</p>
          ) : (
            <form className="space-y-3" onSubmit={handleLink}>
              {error && <p className="alert-err">{error}</p>}
              <div>
                <label className="field-label">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="inp"
                  required
                  autoComplete="new-password"
                />
                {password && pwErrors.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-[var(--ink-3)]">
                    {pwErrors.map((msg) => (
                      <li key={msg} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[var(--ink-4)]" />{msg}
                      </li>
                    ))}
                  </ul>
                )}
                {password && pwErrors.length === 0 && (
                  <p className="mt-1.5 text-xs text-[var(--ok)]">✓ Password looks good</p>
                )}
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={busy || pwErrors.length > 0}>
                {busy ? 'Saving…' : 'Set password'}
              </button>
            </form>
          )}
        </div>

        <button
          type="button"
          onClick={async () => { await signOut(); router.push('/'); }}
          className="btn btn-ghost w-full"
        >
          Sign out
        </button>
      </motion.div>
    </div>
  );
}
