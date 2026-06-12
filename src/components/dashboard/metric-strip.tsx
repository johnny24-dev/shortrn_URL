import type { DashboardMetric } from "@/types/dashboard";

export function MetricStrip({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {metric.label}
          </p>
          <p className="mt-2 truncate text-2xl font-semibold text-slate-950">
            {metric.value}
          </p>
        </div>
      ))}
    </section>
  );
}
