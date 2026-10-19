import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="wrap page">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="t-label-amber inline-flex items-center gap-2 transition hover:text-[var(--ink-1)]">
          ← Back home
        </Link>

        <div className="mt-8">
          <h1 className="t-title">Terms of Service</h1>
          <p className="mt-3 t-small">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="card card-p mt-8 space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">1. Acceptance of Terms</h2>
            <p className="mt-3 t-body">
              By accessing and using Cenit, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to abide by the above, please do not
              use this service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">2. Use License</h2>
            <p className="mt-3 t-body">
              Permission is granted to temporarily download one copy of the materials (information or
              software) on Cenit for personal, non-commercial transitory viewing only. This is the
              grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[var(--ink-2)]">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the site</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">3. Disclaimer</h2>
            <p className="mt-3 t-body">
              The materials on Cenit are provided &quot;as is&quot;. Cenit makes no warranties, expressed
              or implied, and hereby disclaims and negates all other warranties including, without limitation,
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement
              of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">4. Limitations</h2>
            <p className="mt-3 t-body">
              In no event shall Cenit or its suppliers be liable for any damages (including, without
              limitation, damages for loss of data or profit, or due to business interruption) arising out of
              the use or inability to use the materials on Cenit.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">5. Accuracy of Materials</h2>
            <p className="mt-3 t-body">
              The materials appearing on Cenit could include technical, typographical, or photographic
              errors. Cenit does not warrant that any of the materials on its website are accurate,
              complete, or current. Cenit may make changes to the materials contained on its website
              at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">6. Links</h2>
            <p className="mt-3 t-body">
              Cenit has not reviewed all of the sites linked to its website and is not responsible for
              the contents of any such linked site. The inclusion of any link does not imply endorsement by
              Cenit of the site. Use of any such linked website is at the user&apos;s own risk.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">7. Modifications</h2>
            <p className="mt-3 t-body">
              Cenit may revise these terms of service for its website at any time without notice.
              By using this website, you are agreeing to be bound by the then current version of these
              terms of service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">8. Governing Law</h2>
            <p className="mt-3 t-body">
              These terms and conditions are governed by and construed in accordance with the laws of the
              jurisdiction in which Cenit operates, and you irrevocably submit to the exclusive
              jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--ink-1)]">9. Contact Information</h2>
            <p className="mt-3 t-body">If you have any questions about these Terms of Service, please contact us at:</p>
            <p className="mt-2 t-body"><strong className="text-[var(--ink-1)]">Email:</strong>{' '}
              <a href="mailto:business@cenitapp.org" className="font-semibold text-[var(--amber)] hover:text-[var(--amber-hi)]">business@cenitapp.org</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
