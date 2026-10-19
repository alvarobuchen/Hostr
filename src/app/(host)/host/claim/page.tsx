import { ClaimForm } from './claim-form';

export const dynamic = 'force-dynamic';

export default function ClaimVenuePage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="card card-p space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ink-1)]">Claim your venue</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-2)]">
            Enter the claim code Cenit gave you for your venue. It links this account to
            that venue so you can manage its reservations, availability and payouts —
            and nothing else.
          </p>
        </div>
        <ClaimForm />
      </div>
    </div>
  );
}
