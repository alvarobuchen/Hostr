'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { SocialAuth } from '@/components/social-auth';
import { useAuth } from '@/lib/auth-context';
import { authErrorMessage } from '@/lib/auth-errors';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await signIn(email, password);
      // Honor ?callbackUrl (e.g. hosts are sent on to /host after signing in).
      const cb = new URLSearchParams(window.location.search).get('callbackUrl');
      router.push(cb || '/');
    } catch (err) {
      setError(authErrorMessage(err));
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

        <h1 className="font-serif text-3xl font-semibold text-[var(--ink-1)] tracking-tight mb-1.5">Welcome back</h1>
        <p className="text-sm text-[var(--ink-2)] mb-8">Sign in to manage your celebrations.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="alert-err">{error}</p>}

          <div>
            <label className="field-label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="inp" required autoComplete="email" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="field-label mb-0">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-[var(--ink-2)] hover:text-[var(--amber)] transition-colors">
                Forgot password?
              </Link>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="inp" required autoComplete="current-password" />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full mt-2" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-[var(--navy)]/30 border-t-[var(--navy)] animate-spin" />
                Signing in…
              </span>
            ) : 'Sign in'}
          </button>
        </form>

        <SocialAuth callbackUrl="/" />

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 rule" />
          <span className="text-xs text-[var(--ink-3)]">or</span>
          <div className="flex-1 rule" />
        </div>

        <Link href="/guest-login">
          <button className="btn btn-ghost w-full">Continue with a gift code</button>
        </Link>

        <p className="mt-7 text-center text-sm text-[var(--ink-2)]">
          No account?{' '}
          <Link href="/signup" className="font-semibold text-[var(--ink-1)] hover:text-[var(--amber)] transition-colors">
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
