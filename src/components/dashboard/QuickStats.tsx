import { dashboardStats } from "@/lib/mock-data";

export function QuickStats() {
  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3 sm:gap-4">
        {dashboardStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-card/50 p-5 backdrop-blur-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              {stat.label}
            </p>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight">
                {stat.value}
              </span>
              <span className="text-sm font-medium text-muted">{stat.suffix}</span>
            </p>
            <p className="mt-2 text-xs font-medium text-fuchsia-400">{stat.trend}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
