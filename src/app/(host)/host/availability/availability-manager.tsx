'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

type Venue = { id: string; name: string };

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export function AvailabilityManager({ venues }: { venues: Venue[] }) {
  const [venueId, setVenueId] = useState(venues[0]?.id ?? '');
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  // `saved` mirrors what's in Firestore; `draft` is what the host is editing.
  // Nothing reaches guests until Save commits the draft.
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!venueId) return;
    let active = true;
    axios
      .get(`/api/host/availability?venueId=${venueId}`)
      .then((r) => {
        if (!active) return;
        const blockedSet = new Set<string>(r.data.blocked);
        setSaved(blockedSet);
        setDraft(new Set(blockedSet));
        setBooked(new Set<string>(r.data.booked));
        setError(null);
      })
      .catch(() => { if (active) setError('Could not load this calendar.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [venueId]);

  // Which days the host has flipped since the last save.
  const changes = useMemo(() => {
    const added = [...draft].filter((d) => !saved.has(d));
    const removed = [...saved].filter((d) => !draft.has(d));
    return { added, removed, count: added.length + removed.length };
  }, [draft, saved]);

  const dirty = changes.count > 0;

  // Losing a calendar edit to a stray click is worse than one extra prompt.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const days = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    // Convert Sun=0..Sat=6 into a Mon-first offset.
    const lead = (first.getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= count; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [monthCursor]);

  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  // Staged only — the calendar guests see doesn't move until Save.
  function toggle(date: Date) {
    const key = ymd(date);
    if (booked.has(key)) return; // booked days are managed by reservations, not here
    setJustSaved(false);
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function discard() {
    setDraft(new Set(saved));
    setError(null);
    setJustSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await axios.put('/api/host/availability', {
        venueId,
        blocked: [...draft],
      });
      // Trust the server's reconciled list so the UI can't drift from Firestore.
      const committed = new Set<string>(res.data.blocked ?? [...draft]);
      setSaved(committed);
      setDraft(new Set(committed));
      setJustSaved(true);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? 'Could not save your calendar.'
        : 'Could not save your calendar.';
      setError(String(message));
    } finally {
      setSaving(false);
    }
  }

  const monthLabel = monthCursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="card card-p space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {venues.length > 1 ? (
          <select value={venueId} onChange={(e) => setVenueId(e.target.value)} className="inp max-w-xs">
            {venues.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-semibold text-[var(--ink-1)]">{venues[0]?.name}</p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="btn btn-ghost btn-sm"
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="min-w-40 text-center text-sm font-semibold text-[var(--ink-1)]">{monthLabel}</span>
          <button
            type="button"
            onClick={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="btn btn-ghost btn-sm"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-xs font-medium text-[var(--ink-3)]">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((date, i) => {
            if (!date) return <div key={`e${i}`} />;
            const key = ymd(date);
            const past = date < today;
            const isBooked = booked.has(key);
            const isBlocked = draft.has(key);
            const changed = draft.has(key) !== saved.has(key);
            const disabled = past || isBooked || saving;

            let cls = 'border-[var(--line)] bg-[var(--bg-1)] text-[var(--ink-1)] hover:border-[var(--line-2)]';
            if (isBooked) cls = 'border-[var(--amber)] bg-[var(--amber-soft,rgba(176,131,46,0.12))] text-[var(--ink-2)] cursor-not-allowed';
            else if (isBlocked) cls = 'border-transparent bg-[var(--ink-1)] text-white';
            else if (past) cls = 'border-transparent bg-[var(--bg-2)] text-[var(--ink-3)] cursor-not-allowed';

            // Ring marks a day edited but not yet committed.
            const ring = changed ? ' ring-2 ring-offset-1 ring-[var(--amber)]' : '';

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => toggle(date)}
                title={
                  isBooked
                    ? 'Booked'
                    : `${isBlocked ? 'Blocked — click to reopen' : 'Open — click to block'}${changed ? ' (unsaved)' : ''}`
                }
                className={`aspect-square rounded-lg border text-sm font-medium transition-colors ${cls}${ring}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[var(--ink-2)]">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-[var(--line)] bg-[var(--bg-1)]" /> Open</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[var(--ink-1)]" /> Blocked</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-[var(--amber)] bg-[rgba(176,131,46,0.12)]" /> Booked</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded ring-2 ring-[var(--amber)]" /> Unsaved</span>
      </div>

      <div className="rule" />

      {/* Save bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--ink-2)]" aria-live="polite">
          {error ? (
            <span className="font-medium text-red-600">{error}</span>
          ) : dirty ? (
            <>
              <span className="font-medium text-[var(--ink-1)]">
                {changes.count} unsaved {changes.count === 1 ? 'change' : 'changes'}
              </span>
              {changes.added.length > 0 && <> · {changes.added.length} to block</>}
              {changes.removed.length > 0 && <> · {changes.removed.length} to reopen</>}
            </>
          ) : justSaved ? (
            <span className="font-medium text-emerald-600">
              Saved — guests now see this availability.
            </span>
          ) : (
            'Click a date to block or reopen it, then save.'
          )}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={discard}
            disabled={!dirty || saving}
          >
            Discard
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={save}
            disabled={!dirty || saving || loading}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
