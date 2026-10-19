'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { useAuth } from '@/lib/auth-context';

export default function ForgotPasswordPage() {
  const { sendReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Firebase sends the reset email and hosts the reset page itself.
      await sendReset(email);
      setSent(true);
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/invalid-email') {
        setError('That email address looks invalid.');
      } else {
        // Don't reveal whether the account exists — show the generic confirmation.
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-64px)] flex items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <Logo href="/" className="mb-8" />

        <h1 className="font-serif text-3xl font-semibold text-[var(--ink-1)] tracking-tight mb-1.5">
          Reset your password
        </h1>
        <p className="text-sm text-[var(--ink-2)] mb-8">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>

        {sent ? (
          <div className="space-y-6">
            <div className="alert-ok">
              If an account exists for <span className="font-semibold">{email}</span>, a reset link is on
              its way. Check your inbox (and spam).
            </div>
            <Link href="/login">
              <button className="btn btn-ghost w-full">Back to sign in</button>
            </Link>
          </div>
        ) : (
          <>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && <p className="alert-err">{error}</p>}
              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="inp"
                  required
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-[var(--navy)]/30 border-t-[var(--navy)] animate-spin" />
                    Sending…
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[var(--ink-2)]">
              Remembered it?{' '}
              <Link href="/login" className="font-semibold text-[var(--ink-1)] hover:text-[var(--amber)] transition-colors">
                Sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
