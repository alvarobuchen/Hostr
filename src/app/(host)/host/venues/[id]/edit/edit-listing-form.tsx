'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export type EditableAddOn = {
  name: string;
  description: string;
  price: number;
};

export type EditableVenue = {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  minPrice: number | null;
  maxHours: number;
  maxDrinks: number;
  drinkUnitPrice: number;
  barraLibrePrice: number | null;
  cateringPerGuest: number;
  images: string[];
  addOns: EditableAddOn[];
};

/** Money/'' round-trip: inputs hold strings so a cleared field stays cleared. */
function moneyToInput(v: number | null): string {
  return v === null || v === undefined ? '' : String(v);
}

export function EditListingForm({ venue }: { venue: EditableVenue }) {
  const router = useRouter();

  const [name, setName] = useState(venue.name);
  const [description, setDescription] = useState(venue.description);
  const [location, setLocation] = useState(venue.location);
  const [capacity, setCapacity] = useState(String(venue.capacity));
  const [pricePerHour, setPricePerHour] = useState(String(venue.pricePerHour));
  const [minPrice, setMinPrice] = useState(moneyToInput(venue.minPrice));
  const [maxHours, setMaxHours] = useState(String(venue.maxHours));
  const [maxDrinks, setMaxDrinks] = useState(String(venue.maxDrinks));
  const [drinkUnitPrice, setDrinkUnitPrice] = useState(String(venue.drinkUnitPrice));
  const [barraLibrePrice, setBarraLibrePrice] = useState(moneyToInput(venue.barraLibrePrice));
  const [cateringPerGuest, setCateringPerGuest] = useState(String(venue.cateringPerGuest));
  const [images, setImages] = useState<string[]>(venue.images);
  const [newImage, setNewImage] = useState('');
  const [addOns, setAddOns] = useState<EditableAddOn[]>(venue.addOns);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Mirrors the guest-facing dropdown so the host sees exactly what they ship.
  const drinkTiers = useMemo(() => {
    const cap = Number(maxDrinks);
    if (!Number.isFinite(cap) || cap < 1) return [] as string[];
    const tiers = Array.from({ length: Math.min(cap, 20) }, (_, i) => `${i + 1} drink${i ? 's' : ''}`);
    if (barraLibrePrice !== '') tiers.push('Barra Libre');
    return tiers;
  }, [maxDrinks, barraLibrePrice]);

  function addImage() {
    const url = newImage.trim();
    if (!url) return;
    setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
    setNewImage('');
  }

  function moveImage(index: number, delta: number) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateAddOn(index: number, patch: Partial<EditableAddOn>) {
    setAddOns((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await axios.patch(`/api/host/venues/${venue.id}`, {
        name,
        description,
        location,
        capacity: Number(capacity),
        pricePerHour: Number(pricePerHour),
        minPrice: minPrice === '' ? null : Number(minPrice),
        maxHours: Number(maxHours),
        maxDrinks: Number(maxDrinks),
        drinkUnitPrice: Number(drinkUnitPrice),
        barraLibrePrice: barraLibrePrice === '' ? null : Number(barraLibrePrice),
        cateringPerGuest: Number(cateringPerGuest),
        images,
        addOns,
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? 'Could not save your changes.'
        : 'Could not save your changes.';
      setError(String(message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-5">

      {/* ── Basics ── */}
      <section className="card card-p space-y-4">
        <h3 className="text-base font-semibold text-[var(--ink-1)]">Basics</h3>

        <div>
          <label className="field-label" htmlFor="venue-name">Venue name</label>
          <input id="venue-name" className="inp" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="field-label" htmlFor="venue-location">Location</label>
          <input
            id="venue-location"
            className="inp"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Carrer d'Exemple 1, Barcelona"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="venue-description">Description</label>
          <textarea
            id="venue-description"
            className="inp min-h-44 resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--ink-3)]">
            {description.trim().length} characters · minimum 20
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor="venue-capacity">Capacity (guests)</label>
          <input
            id="venue-capacity"
            className="inp"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>
      </section>

      {/* ── Photos ── */}
      <section className="card card-p space-y-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--ink-1)]">Photos</h3>
          <p className="mt-1 text-sm text-[var(--ink-2)]">
            The first photo is the cover shown on venue cards and search results.
          </p>
        </div>

        {images.length === 0 ? (
          <p className="text-sm text-[var(--ink-3)]">
            No photos yet — guests will see the branded Cenit glyph instead.
          </p>
        ) : (
          <div className="space-y-2.5">
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-3"
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-3)]">
                  {/* Hosts can paste any path/URL, so this stays unoptimized. */}
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" unoptimized />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-[var(--ink-2)]">{src}</p>
                  {i === 0 && <span className="badge badge-amber mt-1">Cover</span>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-label="Move photo up"
                    disabled={i === 0}
                    onClick={() => moveImage(i, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-label="Move photo down"
                    disabled={i === images.length - 1}
                    onClick={() => moveImage(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="inp flex-1"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addImage(); }
            }}
            placeholder="/venues/my-venue/1.jpg or https://…"
            aria-label="New photo path or URL"
          />
          <button type="button" className="btn btn-ghost" onClick={addImage}>Add photo</button>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="card card-p space-y-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--ink-1)]">Pricing</h3>
          <p className="mt-1 text-sm text-[var(--ink-2)]">
            These drive the live estimator guests use before they book.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="venue-pph">Price per hour ($)</label>
            <input
              id="venue-pph"
              className="inp"
              type="number"
              min={0}
              step="any"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="venue-min">Minimum price ($)</label>
            <input
              id="venue-min"
              className="inp"
              type="number"
              min={0}
              step="any"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="No minimum"
            />
            <p className="mt-1 text-xs text-[var(--ink-3)]">
              The estimator never quotes below this. Leave blank for no floor.
            </p>
          </div>
          <div>
            <label className="field-label" htmlFor="venue-maxhours">Maximum hours</label>
            <input
              id="venue-maxhours"
              className="inp"
              type="number"
              min={1}
              max={24}
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--ink-3)]">Longest event a guest can book.</p>
          </div>
          <div>
            <label className="field-label" htmlFor="venue-catering">Catering per guest ($)</label>
            <input
              id="venue-catering"
              className="inp"
              type="number"
              min={0}
              step="any"
              value={cateringPerGuest}
              onChange={(e) => setCateringPerGuest(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ── Drinks ── */}
      <section className="card card-p space-y-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--ink-1)]">Drinks</h3>
          <p className="mt-1 text-sm text-[var(--ink-2)]">
            Guests pick drinks per person up to your cap, then an open-bar option.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="venue-maxdrinks">Max drinks per person</label>
            <input
              id="venue-maxdrinks"
              className="inp"
              type="number"
              min={0}
              max={20}
              value={maxDrinks}
              onChange={(e) => setMaxDrinks(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="venue-drinkprice">Price per drink ($)</label>
            <input
              id="venue-drinkprice"
              className="inp"
              type="number"
              min={0}
              step="any"
              value={drinkUnitPrice}
              onChange={(e) => setDrinkUnitPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="venue-barra">Barra Libre per guest ($)</label>
            <input
              id="venue-barra"
              className="inp"
              type="number"
              min={0}
              step="any"
              value={barraLibrePrice}
              onChange={(e) => setBarraLibrePrice(e.target.value)}
              placeholder="Not offered"
            />
            <p className="mt-1 text-xs text-[var(--ink-3)]">Blank hides the open-bar option.</p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4">
          <p className="t-label mb-2">Guests will see</p>
          {drinkTiers.length === 0 ? (
            <p className="text-sm text-[var(--ink-3)]">No drink options.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {drinkTiers.map((t) => (
                <span key={t} className={t === 'Barra Libre' ? 'badge badge-amber' : 'badge'}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Add-ons ── */}
      <section className="card card-p space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--ink-1)]">Add-ons</h3>
            <p className="mt-1 text-sm text-[var(--ink-2)]">Extras guests can add to a booking.</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm shrink-0"
            onClick={() => setAddOns((prev) => [...prev, { name: '', description: '', price: 0 }])}
          >
            Add extra
          </button>
        </div>

        {addOns.length === 0 ? (
          <p className="text-sm text-[var(--ink-3)]">No add-ons yet.</p>
        ) : (
          <div className="space-y-3">
            {addOns.map((a, i) => (
              <div
                key={i}
                className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-4"
              >
                <div className="flex gap-3">
                  <input
                    className="inp flex-1"
                    value={a.name}
                    onChange={(e) => updateAddOn(i, { name: e.target.value })}
                    placeholder="Add-on name"
                    aria-label="Add-on name"
                  />
                  <input
                    className="inp w-32"
                    type="number"
                    min={0}
                    step="any"
                    value={a.price}
                    onChange={(e) => updateAddOn(i, { price: Number(e.target.value) })}
                    aria-label="Add-on price"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm shrink-0"
                    onClick={() => setAddOns((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="inp"
                  value={a.description}
                  onChange={(e) => updateAddOn(i, { description: e.target.value })}
                  placeholder="Short description (optional)"
                  aria-label="Add-on description"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Save ── */}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && !error && (
          <span className="text-sm font-medium text-emerald-600">Saved — your listing is live.</span>
        )}
        {error && <span className="text-sm font-medium text-red-600">{error}</span>}
      </div>
    </form>
  );
}
