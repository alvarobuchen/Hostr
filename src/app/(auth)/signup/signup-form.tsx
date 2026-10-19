'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { SocialAuth } from '@/components/social-auth';
import { useAuth } from '@/lib/auth-context';
import { authErrorMessage } from '@/lib/auth-errors';

const validatePassword = (pw: string) => {
  const errors: string[] = [];
  if (pw.length < 8)       errors.push('At least 8 characters');
  if (!/[A-Z]/.test(pw))   errors.push('One uppercase letter');
  if (!/[a-z]/.test(pw))   errors.push('One lowercase letter');
  if (!/[0-9]/.test(pw))   errors.push('One number');
  return errors;
};

/**
 * Shared account-creation form. In `host` mode it uses venue-owner copy and
 * sends the new user on to claim their venue (/host) after signing in.
 */
export function SignupForm({ host = false }: { host?: boolean }) {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const pwErrors = validatePassword(password);

  // Where the user ends up after creating the account. Hosts go to /host, which
  // routes them to the claim-code step; everyone else lands on the home page.
  const afterAuth = host ? '/host' : '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwErrors.length) { setError('Please fix the password requirements.'); return; }
    setLoading(true); setError('');
    try {
      // Firebase creates the account, signs the user in, and the AuthProvider
      // sets the session cookie — so we can go straight to the destination.
      await signUp(email, password, name);
      router.push(afterAuth);
    } catch (err: unknown) {
      setError(authErrorMessage(err, 'Failed to create account.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100svh-64px)] flex items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <Logo href="/" className="mb-8" />

        {host && <p className="t-label-amber mb-2">For venue hosts</p>}
        <h1 className="font-serif text-3xl font-semibold text-[var(--ink-1)] tracking-tight mb-1.5">
          {host ? 'List your venue' : 'Create an account'}
        </h1>
        <p className="text-sm text-[var(--ink-2)] mb-8">
          {host
            ? 'Create your host account, then add your venue with the code we gave you.'
            : 'Start planning unforgettable celebrations.'}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="alert-err">{error}</p>}

          <div>
            <label className="field-label">Full name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="inp" required autoComplete="name" />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="inp" required autoComplete="email" />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className="inp" required autoComplete="new-password" />
            {password && pwErrors.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-[var(--ink-3)]">
                {pwErrors.map((e) => <li key={e} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[var(--ink-4)]" />{e}</li>)}
              </ul>
            )}
            {password && pwErrors.length === 0 && (
              <p className="mt-1.5 text-xs text-[var(--ok)]">✓ Password looks good</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full mt-2" disabled={loading || pwErrors.length > 0}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-[var(--navy)]/30 border-t-[var(--navy)] animate-spin" />
                Creating account…
              </span>
            ) : host ? 'Create host account' : 'Create account'}
          </button>
        </form>

        <SocialAuth callbackUrl={afterAuth} />

        <div className="mt-7 space-y-2 text-center text-sm text-[var(--ink-2)]">
          <p>
            Already have an account?{' '}
            <Link href={`/login?callbackUrl=${encodeURIComponent(afterAuth)}`} className="font-semibold text-[var(--ink-1)] hover:text-[var(--amber)] transition-colors">
              Sign in
            </Link>
          </p>
          <p>
            {host ? (
              <>Planning a party instead?{' '}
                <Link href="/signup" className="font-semibold text-[var(--ink-1)] hover:text-[var(--amber)] transition-colors">Create a guest account</Link>
              </>
            ) : (
              <>Own a venue?{' '}
                <Link href="/host-signup" className="font-semibold text-[var(--ink-1)] hover:text-[var(--amber)] transition-colors">Sign up as a host</Link>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
