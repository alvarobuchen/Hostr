'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CONTACT_EMAIL = 'business@cenitapp.org';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message.');
      }
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap page">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="t-label-amber inline-flex items-center gap-2 transition hover:text-[var(--ink-1)]"
        >
          ← Back home
        </Link>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left — intro + details */}
          <div>
            <p className="t-label-amber mb-3">Contact support</p>
            <h1 className="t-title max-w-md">Let&apos;s make your celebration unforgettable</h1>
            <p className="mt-4 t-body max-w-xl">
              Send us a message about venue booking, shared gifts, guest access, or anything
              Cenit-related. Our team replies with a premium response as soon as possible.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="card card-p">
                <p className="t-label mb-2">Email</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-base font-semibold text-[var(--ink-1)] transition hover:text-[var(--amber)]"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div className="card card-p">
                <p className="t-label mb-2">Office</p>
                <p className="text-lg font-semibold text-[var(--ink-1)]">123 Celebration Avenue</p>
              </div>
            </div>
          </div>

          {/* Right — message form */}
          <div className="card card-p">
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">Send us a message</h2>

            {/* Direct email, visible right under the heading */}
            <p className="mt-2.5 text-sm text-[var(--ink-2)]">
              Prefer email? Reach us directly at{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-[var(--amber)] transition hover:text-[var(--amber-hi)]"
              >
                {CONTACT_EMAIL}
              </a>
            </p>

            <p className="mt-3 text-sm leading-6 text-[var(--ink-3)]">
              Fill out the form and our Cenit concierge will follow up shortly.
            </p>

            {success && (
              <div className="alert-ok mt-6">✓ Message sent successfully! We&apos;ll reply soon.</div>
            )}
            {error && <div className="alert-err mt-6">{error}</div>}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="field-label">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="inp"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="field-label">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="inp"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="field-label">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="inp"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="field-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="inp resize-none"
                  placeholder="Tell us more about your request"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
