import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { upcomingEvent } from "@/lib/mock-data";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Built for big nights — 50 to 100 guests, zero chaos
        </div>

        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          Your party.{" "}
          <span className="text-gradient">One app.</span>
          <br />
          Zero fragmentation.
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Discover venues and vendors, send interactive invites, and collect
          group gifts — all in one energetic flow made for milestone celebrations
          in Spain.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/explore"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 text-sm font-semibold text-white shadow-xl shadow-fuchsia-500/30 transition hover:brightness-110"
          >
            Start planning
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#phases"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 text-sm font-semibold transition hover:bg-white/10"
          >
            See how it works
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-card/60 p-4 backdrop-blur-sm sm:gap-6 sm:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Next up
            </p>
            <p className="mt-1 text-lg font-bold">{upcomingEvent.title}</p>
          </div>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div className="flex items-center gap-2 text-sm text-muted">
            <Calendar className="h-4 w-4 shrink-0 text-fuchsia-400" />
            {upcomingEvent.date}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4 shrink-0 text-cyan-400" />
            {upcomingEvent.location}
          </div>
          <div className="ml-auto rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
            {upcomingEvent.daysLeft} days left
          </div>
        </div>
      </div>
    </section>
  );
}
