import type { DashboardMetric } from "@/types/dashboard";

export function MetricStrip({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <section className="surface-panel grid overflow-hidden rounded-lg sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className="border-b border-[#e8e1d7] p-5 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#77726c]">
            {metric.label}
          </p>
          <p className="mt-2 truncate text-3xl font-black tracking-tight text-black">
            {metric.value}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#0f8f55]">
            {index % 2 === 0 ? "+12.5%" : "+8.7%"} vs last 30 days
          </p>
        </div>
      ))}
    </section>
  );
}
