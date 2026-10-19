'use client';

import { useMemo, useState } from 'react';

export type Msg = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
  createdAt: string;
};

type Filter = 'all' | 'new' | 'handled';

export function MessagesInbox({ initial }: { initial: Msg[] }) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const newCount = useMemo(() => messages.filter((m) => !m.handled).length, [messages]);
  const shown = useMemo(
    () =>
      messages.filter((m) =>
        filter === 'all' ? true : filter === 'new' ? !m.handled : m.handled,
      ),
    [messages, filter],
  );

  const toggle = async (m: Msg) => {
    setBusy(m.id);
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id, handled: !m.handled }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, handled: !x.handled } : x)));
      }
    } finally {
      setBusy(null);
    }
  };

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: `All (${messages.length})` },
    { key: 'new', label: `New (${newCount})` },
    { key: 'handled', label: `Handled (${messages.length - newCount})` },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="t-label-amber mb-2">Owner inbox</p>
          <h1 className="t-title">Contact messages</h1>
        </div>
        <div className="flex gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`btn btn-sm ${filter === t.key ? 'btn-primary' : 'btn-ghost'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rule" />

      {/* List */}
      {shown.length === 0 ? (
        <div className="card card-p text-center py-16">
          <p className="t-body">No messages here yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((m) => (
            <div key={m.id} className="card card-p space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-semibold text-[var(--ink-1)] truncate">{m.subject}</h3>
                    {!m.handled && <span className="badge badge-amber">New</span>}
                  </div>
                  <p className="mt-1 text-sm text-[var(--ink-2)]">
                    {m.name} ·{' '}
                    <a href={`mailto:${m.email}`} className="text-[var(--amber)] hover:text-[var(--amber-hi)] transition">
                      {m.email}
                    </a>
                  </p>
                </div>
                <span className="t-mono text-[var(--ink-3)] shrink-0">
                  {new Date(m.createdAt).toLocaleString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-sm leading-6 text-[var(--ink-2)] whitespace-pre-wrap rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4">
                {m.message}
              </p>

              <div className="flex flex-wrap gap-2.5">
                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}>
                  <button className="btn btn-primary btn-sm">Reply</button>
                </a>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={busy === m.id}
                  onClick={() => toggle(m)}
                >
                  {busy === m.id ? '…' : m.handled ? 'Reopen' : 'Mark handled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessagesInbox;
