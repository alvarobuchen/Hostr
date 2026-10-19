'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Status = {
  configured: boolean;
  connected: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  available?: number;
  pending?: number;
  currency?: string;
  dashboardUrl?: string | null;
  error?: boolean;
};

/** "Get paid" panel — onboard a bank account and withdraw collected funds. */
export function PayoutPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const r = await axios.get<Status>('/api/connect/status');
      setStatus(r.data);
    } catch {
      setStatus({ configured: false, connected: false });
    }
  };
  useEffect(() => {
    const id = requestAnimationFrame(() => { load(); });
    return () => cancelAnimationFrame(id);
  }, []);

  const onboard = async () => {
    setBusy(true); setMsg('');
    try {
      const r = await axios.post<{ url: string }>('/api/connect/account-link');
      window.location.href = r.data.url;
    } catch (e) {
      setMsg(axios.isAxiosError(e) ? (e.response?.data?.error || 'Could not start onboarding.') : 'Could not start onboarding.');
      setBusy(false);
    }
  };

  const withdraw = async () => {
    setBusy(true); setMsg('');
    try {
      const r = await axios.post('/api/connect/payout');
      if (r.data.ok) {
        const total = (r.data.payouts || []).reduce((s: number, p: { amount: number }) => s + p.amount, 0);
        setMsg(`Withdrawal started — ${status?.currency === 'USD' ? '$' : ''}${total.toFixed(2)} is on its way to your bank.`);
        await load();
      } else {
        setMsg(r.data.message || 'No funds available to withdraw yet.');
      }
    } catch (e) {
      setMsg(axios.isAxiosError(e) ? (e.response?.data?.error || 'Withdrawal failed.') : 'Withdrawal failed.');
    } finally { setBusy(false); }
  };

  // Hide entirely when Stripe isn't configured
  if (!status || status.configured === false) return null;

  const money = (n?: number) =>
    `${status.currency === 'USD' || !status.currency ? '$' : ''}${(n ?? 0).toFixed(2)}${status.currency && status.currency !== 'USD' ? ' ' + status.currency : ''}`;

  return (
    <div className="card card-p">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="t-label-amber mb-1.5">Get paid</p>
          {!status.connected ? (
            <p className="t-body max-w-md">Connect a bank account to receive the money guests contribute to your gifts.</p>
          ) : !status.payoutsEnabled ? (
            <p className="t-body max-w-md">Your bank setup isn&apos;t finished yet. Complete it to start receiving payouts.</p>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <span className="text-2xl font-semibold tracking-tight text-[var(--ink-1)]">{money(status.available)}</span>
              <span className="t-label">Available</span>
              {!!status.pending && <span className="text-sm text-[var(--ink-3)]">· {money(status.pending)} pending</span>}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {!status.connected ? (
            <button onClick={onboard} disabled={busy} className="btn btn-primary">{busy ? 'Opening…' : 'Connect bank account'}</button>
          ) : !status.payoutsEnabled ? (
            <button onClick={onboard} disabled={busy} className="btn btn-primary">{busy ? 'Opening…' : 'Finish setup'}</button>
          ) : (
            <>
              <button onClick={withdraw} disabled={busy} className="btn btn-primary">{busy ? 'Working…' : 'Withdraw to bank'}</button>
              {status.dashboardUrl && (
                <a href={status.dashboardUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Manage in Stripe</a>
              )}
            </>
          )}
        </div>
      </div>

      {msg && <p className="mt-4 text-sm text-[var(--ink-2)]">{msg}</p>}
    </div>
  );
}

export default PayoutPanel;
