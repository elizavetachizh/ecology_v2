import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatBalanceAmount,
  toFormedMonthPoints,
  toFormedUnitPoints,
  wasteTitle,
  type DashboardFormedStat,
} from "../../../../entities/waste/dashboards";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
import { ApiError } from "../../../../shared/api/api-client";
import { ChartEmpty, ChartFrame, ChartHeader } from "./dashboard-chart";

const FORMED_MONTH_LABELS = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
] as const;

type DashboardFormedChartsProps = {
  stat: DashboardFormedStat | null;
  loading?: boolean;
  error?: Error | null;
  selected: boolean;
};

function formedMonthLabel(month: number): string {
  return FORMED_MONTH_LABELS[month - 1] ?? String(month);
}

function tooltipEntries(payload: unknown): { name: string; value: string }[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((entry) => {
    const item = entry as { name?: unknown; value?: unknown };
    const value = item.value;
    if (typeof value !== "number" && typeof value !== "string") return [];
    return [
      {
        name:
          item.name == null || item.name === "amount" ? "" : String(item.name),
        value: String(value),
      },
    ];
  });
}

function FormedTooltip({
  active,
  label,
  payload,
  uom,
  formatLabel,
}: {
  active?: boolean;
  label?: string | number;
  payload?: unknown;
  uom: string;
  formatLabel?: (label: string | number) => string;
}) {
  const entries = tooltipEntries(payload);
  if (!active || label == null || entries.length === 0) return null;
  const title = formatLabel ? formatLabel(label) : String(label);
  return (
    <div className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs shadow-sm">
      <p className="text-muted-foreground">{title}</p>
      {entries.map((entry) => (
        <p key={entry.name || entry.value} className="font-medium tabular-nums">
          {entry.name ? `${entry.name}: ` : ""}
          {`${formatBalanceAmount(entry.value)} ${uom}`}
        </p>
      ))}
    </div>
  );
}

function ChartStatus({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ChartFrame>
        <ChartHeader title={title} description={description} />
        <ChartEmpty>{children}</ChartEmpty>
      </ChartFrame>
    </div>
  );
}

export function DashboardFormedCharts({
  stat,
  loading = false,
  error = null,
  selected,
}: DashboardFormedChartsProps) {
  if (!selected) {
    return (
      <ChartStatus
        title="Образование отходов"
        description="Выберите отход в таблице, чтобы увидеть распределение по подразделениям и динамику по месяцам."
      >
        Нет выбранного отхода.
      </ChartStatus>
    );
  }

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <ChartStatus title="Образование отходов">
        {notFound ? "Отход не найден в организации" : error.message}
      </ChartStatus>
    );
  }

  if (loading && !stat) {
    return <ChartStatus title="Образование отходов">Загрузка…</ChartStatus>;
  }

  if (!stat) return null;

  const units = toFormedUnitPoints(stat.units);
  const months = toFormedMonthPoints(stat.months);
  const uom = UOM_LABEL[stat.waste.uom];
  const waste = wasteTitle(stat.waste);
  const currentYear = String(stat.year);
  const previousYear = String(stat.previous_year);

  return (
    <div className="flex flex-col gap-4">
      <ChartFrame>
        <ChartHeader title="По подразделениям" description={waste} />
        <div
          className="h-72 w-full min-w-0"
          role="img"
          aria-label="Образование отходов по подразделениям"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={units}
              margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                interval={0}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                tickFormatter={(value: number) =>
                  formatBalanceAmount(String(value))
                }
                width={48}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }}
                content={(props) => (
                  <FormedTooltip
                    active={props.active}
                    label={props.label}
                    payload={props.payload}
                    uom={uom}
                  />
                )}
              />
              <Bar
                dataKey="amount"
                fill="var(--chart-3)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>

      <ChartFrame>
        <ChartHeader title="По месяцам" description={waste} />
        <ul
          aria-label="Годы на графике"
          className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"
        >
          <li className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-sm"
              style={{ background: "var(--chart-3)" }}
              aria-hidden
            />
            {currentYear}
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-sm"
              style={{ background: "var(--chart-1)" }}
              aria-hidden
            />
            {previousYear}
          </li>
        </ul>
        <div
          className="h-72 w-full min-w-0"
          role="img"
          aria-label="Образование отходов по месяцам"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={months}
              margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickFormatter={(value: number) => formedMonthLabel(value)}
                interval={0}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                tickFormatter={(value: number) =>
                  formatBalanceAmount(String(value))
                }
                width={48}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--chart-3)", strokeDasharray: "3 3" }}
                content={(props) => (
                  <FormedTooltip
                    active={props.active}
                    label={props.label}
                    payload={props.payload}
                    uom={uom}
                    formatLabel={(value) => formedMonthLabel(Number(value))}
                  />
                )}
              />
              <Line
                type="monotone"
                dataKey="current"
                name={currentYear}
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="previous"
                name={previousYear}
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </div>
  );
}
