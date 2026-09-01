import type { DashboardBalanceSummary } from "../../../../entities/waste/dashboards";

type DashboardSummaryProps = {
  summary: DashboardBalanceSummary;
};

const CARDS: {
  key: keyof DashboardBalanceSummary;
  label: string;
}[] = [
  { key: "unitCount", label: "Подразделений" },
  { key: "wasteCount", label: "Позиций" },
  { key: "nonZeroCount", label: "Ненулевых" },
];

export function DashboardSummary({ summary }: DashboardSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CARDS.map((card) => (
        <article
          key={card.key}
          className="rounded-xl border border-border bg-card p-4"
        >
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
            {summary[card.key]}
          </p>
        </article>
      ))}
    </div>
  );
}
