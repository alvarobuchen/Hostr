import { phases } from "@/lib/navigation";

export function JourneyStrip() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02] px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <p className="text-center text-sm font-medium text-muted sm:text-left">
          Discovery → Invitation → Collection
        </p>
        <div className="flex w-full max-w-md items-center gap-2 sm:max-w-lg">
          {phases.map((phase, index) => (
            <div key={phase.id} className="flex flex-1 items-center gap-2">
              <div
                className={`h-2 flex-1 rounded-full bg-gradient-to-r ${phase.accent} ${
                  index === 0 ? "opacity-100" : index === 1 ? "opacity-80" : "opacity-60"
                }`}
              />
              {index < phases.length - 1 && (
                <span className="hidden text-muted sm:inline">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
