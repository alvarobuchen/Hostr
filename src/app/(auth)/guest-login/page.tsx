'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useI18n } from '@/lib/i18n';

export default function GuestLoginPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [giftCode, setGiftCode] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return new URLSearchParams(window.location.search).get('code')?.toUpperCase() || '';
  });
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/guest-login', {
        code: giftCode.toUpperCase(),
        name: guestName,
      });

      if (res.status === 200) {
        router.push(`/gift/${giftCode.toUpperCase()}`);
      }
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.error || 'Invalid gift code. Please try again.');
      } else {
        setError('Invalid gift code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap page">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1fr_0.86fr]">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="t-label-amber mb-3">{t('guest.kicker')}</p>
          <h1 className="t-title max-w-md">{t('guest.title')}</h1>
          <p className="mt-4 t-body max-w-md">{t('guest.subtitle')}</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="card card-p"
        >
          <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">{t('guest.form.title')}</h2>
          <p className="mt-2 text-sm text-[var(--ink-2)]">{t('guest.form.subtitle')}</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {user && (
              <div className="alert-info">
                Organizers can&apos;t use the guest flow while signed in. Open your{' '}
                <Link href="/gifts" className="font-semibold underline">dashboard</Link>{' '}and share this code with guests instead.
              </div>
            )}
            {error && <p className="alert-err">{error}</p>}

            <div>
              <label className="field-label">Gift code</label>
              <input
                type="text"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                className="inp tracking-[0.18em] font-medium"
                required
              />
            </div>
            <div>
              <label className="field-label">Your name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. María López"
                className="inp"
                required
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading || Boolean(user)}>
              {loading ? 'Accessing…' : 'Access gift'}
            </Button>
          </form>

          <div className="mt-6 space-y-1.5 text-center text-sm text-[var(--ink-2)]">
            <p>
              Have an account?{' '}
              <Link href="/login" className="font-semibold text-[var(--ink-1)] hover:text-[var(--amber)] transition-colors">Sign in instead</Link>
            </p>
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-[var(--ink-1)] hover:text-[var(--amber)] transition-colors">Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
