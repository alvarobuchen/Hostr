import Link from "next/link";
import { Compass, Users, Wallet, ArrowUpRight } from "lucide-react";
import { phases } from "@/lib/navigation";

const icons = {
  compass: Compass,
  users: Users,
  wallet: Wallet,
} as const;

export function PhaseShowcase() {
  return (
    <section id="phases" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-fuchsia-400">
            The host journey
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Three phases. One seamless flow.
          </h2>
          <p className="mt-3 text-muted">
            From finding the perfect rooftop in Madrid to watching your party fund
            hit goal — every step lives inside Hostr.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          {phases.map((phase) => {
            const Icon = icons[phase.icon];
            return (
              <article
                key={phase.id}
                id={phase.id}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/40 p-6 shadow-xl backdrop-blur-sm transition hover:border-white/20 hover:bg-card/60 ${phase.glow}`}
              >
                <div
                  className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition group-hover:opacity-30 ${phase.accent}`}
                />

                <div className="relative flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg">
                    <span className={`absolute inset-0 rounded-2xl bg-gradient-to-br opacity-100 ${phase.accent}`} />
                    <Icon className="relative h-5 w-5" strokeWidth={2.5} />
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-muted">
                    Phase {phase.step}
                  </span>
                </div>

                <h3 className="relative mt-5 text-xl font-bold">{phase.title}</h3>
                <p className="relative mt-1 text-sm font-semibold text-fuchsia-300/90">
                  {phase.tagline}
                </p>
                <p className="relative mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {phase.description}
                </p>

                <Link
                  href={phase.href}
                  className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition group-hover:gap-2.5"
                >
                  {phase.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
