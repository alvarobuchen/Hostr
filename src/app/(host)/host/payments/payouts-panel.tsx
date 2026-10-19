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
};

export function PayoutsPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await axios.get('/api/connect/status');
      setStatus(r.data);
    } catch {
      setStatus({ configured: false, connected: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    axios
      .get('/api/connect/status')
      .then((r) => { if (active) setStatus(r.data); })
      .catch(() => { if (active) setStatus({ configured: false, connected: false }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function onboard() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await axios.post('/api/connect/account-link');
      if (r.data.url) window.location.href = r.data.url;
    } catch (err) {
      setMsg((axios.isAxiosError(err) && err.response?.data?.error) || 'Could not start onboarding.');
      setBusy(false);
    }
  }

  async function withdraw() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await axios.post('/api/connect/payout');
      setMsg(r.data.ok ? 'Withdrawal started — funds are on the way to your bank.' : r.data.message || 'No funds available yet.');
      await load();
    } catch (err) {
      setMsg((axios.isAxiosError(err) && err.response?.data?.error) || 'Could not start the withdrawal.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="card card-p h-32 animate-pulse bg-[var(--bg-2)]" />;

  if (!status?.configured) {
    return (
      <div className="card card-p">
        <p className="text-sm text-[var(--ink-2)]">
          Payouts aren&apos;t configured on this environment yet. Once Stripe is connected you&apos;ll be
          able to onboard a bank account and withdraw here.
        </p>
      </div>
    );
  }

  const currency = status.currency || 'USD';

  return (
    <div className="card card-p space-y-5">
      {!status.connected || !status.payoutsEnabled ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-[var(--ink-1)]">Connect your bank account</p>
            <p className="mt-1 text-sm text-[var(--ink-2)]">
              Finish a quick Stripe onboarding to start receiving payouts from your bookings.
            </p>
          </div>
          <button type="button" onClick={onboard} disabled={busy} className="btn btn-primary">
            {busy ? 'Opening…' : status.connected ? 'Finish bank onboarding' : 'Connect bank account'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="tile">
              <p className="t-label mb-1.5">Available</p>
              <p className="text-xl font-semibold text-[var(--ink-1)]">
                {status.available?.toFixed(2)} {currency}
              </p>
            </div>
            <div className="tile">
              <p className="t-label mb-1.5">Pending</p>
              <p className="text-xl font-semibold text-[var(--ink-1)]">
                {status.pending?.toFixed(2)} {currency}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={withdraw}
              disabled={busy || !status.available}
              className="btn btn-primary"
            >
              {busy ? 'Working…' : 'Withdraw to bank'}
            </button>
            {status.dashboardUrl && (
              <a href={status.dashboardUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Stripe dashboard
              </a>
            )}
          </div>
        </div>
      )}
      {msg && <p className="text-sm text-[var(--ink-2)]">{msg}</p>}
    </div>
  );
}
