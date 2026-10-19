import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="wrap page">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="t-label-amber inline-flex items-center gap-2 transition hover:text-[var(--ink-1)]">
          ← Back home
        </Link>

        <div className="mt-8">
          <h1 className="t-title">Privacy Policy</h1>
          <p className="mt-3 t-small">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="card card-p mt-8 space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">1. Introduction</h2>
            <p className="mt-3 t-body">
              Cenit (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or &quot;Company&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">2. Information We Collect</h2>
            <p className="mt-3 t-body">We collect information you provide directly to us, such as:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[var(--ink-2)]">
              <li>Name, email address, and password when you create an account</li>
              <li>Payment information when you make purchases or contributions</li>
              <li>Information about parties, venues, and gift preferences</li>
              <li>Communication preferences and feedback</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">3. How We Use Your Information</h2>
            <p className="mt-3 t-body">We use the information we collect to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[var(--ink-2)]">
              <li>Provide, maintain, and improve our services</li>
              <li>Process payments and send related information</li>
              <li>Send transactional and promotional emails</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">4. Data Security</h2>
            <p className="mt-3 t-body">
              We implement appropriate technical and organizational measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction. However,
              no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">5. Cookies</h2>
            <p className="mt-3 t-body">
              We use cookies and similar tracking technologies to track activity on our service and
              hold certain information. You can instruct your browser to refuse all cookies or to
              indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">6. Third-Party Links</h2>
            <p className="mt-3 t-body">
              Our website may contain links to third-party websites. We are not responsible for the
              privacy practices of these external sites. We encourage you to review their privacy
              policies.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">7. Your Rights</h2>
            <p className="mt-3 t-body">
              Depending on your location, you may have the right to access, correct, or delete your
              personal information. Please contact us at{' '}
              <a href="mailto:privacy@cenitapp.org" className="font-semibold text-[var(--amber)] hover:text-[var(--amber-hi)]">privacy@cenitapp.org</a>{' '}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">8. Contact Us</h2>
            <p className="mt-3 t-body">If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2 t-body"><strong className="text-[var(--ink-1)]">Email:</strong>{' '}
              <a href="mailto:privacy@cenitapp.org" className="font-semibold text-[var(--amber)] hover:text-[var(--amber-hi)]">privacy@cenitapp.org</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
