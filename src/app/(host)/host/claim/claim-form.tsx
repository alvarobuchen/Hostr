'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import axios from 'axios';

export function ClaimForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/host/claim', { code });
      // Refresh the Firebase ID token so the header/nav pick up the new HOST role claim.
      await refresh();
      router.push('/host');
      router.refresh();
      return res;
    } catch (err) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.error) ||
        'Something went wrong. Please try again.';
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="claim-code" className="field-label">Claim code</label>
        <input
          id="claim-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="CENIT-XXXXXX"
          autoComplete="off"
          autoCapitalize="characters"
          className="inp uppercase tracking-wider"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading || !code.trim()} className="btn btn-primary w-full">
        {loading ? 'Claiming…' : 'Claim venue'}
      </button>
    </form>
  );
}
