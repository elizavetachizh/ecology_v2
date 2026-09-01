import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DASHBOARD_MONTHS_PRESETS,
  formatBalanceAmount,
  toChartPoints,
  unitTitle,
  wasteTitle,
  type DashboardBalanceStat,
} from "../../../../entities/waste/dashboards";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
import { ApiError } from "../../../../shared/api/api-client";
import { formatDate } from "../../../../shared/lib/format-date";
import { Select } from "../../../../shared/ui";

type DashboardBalanceChartProps = {
  stat: DashboardBalanceStat | null;
  loading?: boolean;
  error?: Error | null;
  months: number;
  onMonthsChange: (months: number) => void;
  selected: boolean;
};

function ChartFrame({ children }: { children: ReactNode }) {
  return (
    <section className="flex min-h-80 flex-col rounded-xl border border-border bg-card p-4">
      {children}
    </section>
  );
}

function monthOptions(months: number): number[] {
  if (DASHBOARD_MONTHS_PRESETS.some((preset) => preset === months)) {
    return [...DASHBOARD_MONTHS_PRESETS];
  }
  return [...DASHBOARD_MONTHS_PRESETS, months].sort((a, b) => a - b);
}

function ChartHeader({
  title,
  description,
  amount,
  months,
  onMonthsChange,
}: {
  title: string;
  description?: string;
  amount?: string;
  months: number;
  onMonthsChange: (months: number) => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0 space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        {amount ? (
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {amount}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">месяцев</span>
        <Select
          aria-label="Число точек графика"
          className="w-20"
          value={String(months)}
          onChange={(event) => onMonthsChange(Number(event.target.value))}
        >
          {monthOptions(months).map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function ChartEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function tooltipValue(payload: unknown): string | number | undefined {
  if (!Array.isArray(payload) || payload[0] == null) return undefined;
  const entry = payload[0] as { value?: unknown };
  const value = entry.value;
  if (typeof value === "number" || typeof value === "string") return value;
  return undefined;
}

function BalanceTooltip({
  active,
  label,
  payload,
  uom,
}: {
  active?: boolean;
  label?: string | number;
  payload?: unknown;
  uom: string;
}) {
  const value = tooltipValue(payload);
  if (!active || label == null || value == null) return null;
  return (
    <div className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs shadow-sm">
      <p className="text-muted-foreground">{formatDate(String(label))}</p>
      <p className="font-medium tabular-nums">
        {`${formatBalanceAmount(String(value))} ${uom}`}
      </p>
    </div>
  );
}

export function DashboardBalanceChart({
  stat,
  loading = false,
  error = null,
  months,
  onMonthsChange,
  selected,
}: DashboardBalanceChartProps) {
  const points = stat ? toChartPoints(stat.points) : [];
  const uom = stat ? UOM_LABEL[stat.waste.uom] : "";
  const last = points[points.length - 1];

  if (!selected) {
    return (
      <ChartFrame>
        <ChartHeader
          title="Динамика остатка"
          description="Выберите отход в таблице, чтобы увидеть график."
          months={months}
          onMonthsChange={onMonthsChange}
        />
        <ChartEmpty>Нет выбранной пары подразделение / отход.</ChartEmpty>
      </ChartFrame>
    );
  }

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <ChartFrame>
        <ChartHeader
          title="Динамика остатка"
          months={months}
          onMonthsChange={onMonthsChange}
        />
        <ChartEmpty>
          {notFound
            ? "Подразделение или отход не найдены в организации."
            : error.message}
        </ChartEmpty>
      </ChartFrame>
    );
  }

  if (loading && !stat) {
    return (
      <ChartFrame>
        <ChartHeader
          title="Динамика остатка"
          months={months}
          onMonthsChange={onMonthsChange}
        />
        <ChartEmpty>Загрузка…</ChartEmpty>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame>
      <ChartHeader
        title="Динамика остатка"
        description={
          stat ? `${unitTitle(stat.unit)} · ${wasteTitle(stat.waste)}` : undefined
        }
        amount={
          last ? `${formatBalanceAmount(String(last.amount))} ${uom}` : undefined
        }
        months={months}
        onMonthsChange={onMonthsChange}
      />
      <div
        className="h-72 w-full min-w-0"
        role="img"
        aria-label="Динамика остатка по месяцам"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={points}
            margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatDate(value)}
              minTickGap={28}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              dataKey="amount"
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
                <BalanceTooltip
                  active={props.active}
                  label={props.label}
                  payload={props.payload}
                  uom={uom}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--chart-3)"
              fill="var(--chart-1)"
              fillOpacity={0.35}
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--chart-3)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
