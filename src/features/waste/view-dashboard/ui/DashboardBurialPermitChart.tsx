import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatBalanceAmount,
  isAmountOverLimit,
  sumChartAmounts,
  toChartPoints,
  wasteTitle,
  type DashboardBurialPermitStat,
} from "../../../../entities/waste/dashboards";
import { unitLabel } from "../../../../entities/waste/units";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
import { ApiError } from "../../../../shared/api/api-client";
import { formatDate } from "../../../../shared/lib/format-date";
import { BURIAL_PERMIT_LIMIT_CAPTION } from "../lib/burial-permit-limit";
import { ChartEmpty, ChartFrame, ChartHeader } from "./dashboard-chart";

type DashboardBurialPermitChartProps = {
  stat: DashboardBurialPermitStat | null;
  loading?: boolean;
  error?: Error | null;
  selected: boolean;
};

function tooltipValue(payload: unknown): string | number | undefined {
  if (!Array.isArray(payload) || payload[0] == null) return undefined;
  const entry = payload[0] as { value?: unknown };
  const value = entry.value;
  if (typeof value === "number" || typeof value === "string") return value;
  return undefined;
}

function BurialTooltip({
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

export function DashboardBurialPermitChart({
  stat,
  loading = false,
  error = null,
  selected,
}: DashboardBurialPermitChartProps) {
  const points = stat ? toChartPoints(stat.points) : [];
  const uom = stat ? UOM_LABEL[stat.waste.uom] : "";
  const yearTotal = stat ? sumChartAmounts(stat.points) : 0;
  const yearOverLimit = stat
    ? isAmountOverLimit(yearTotal, stat.limit)
    : false;

  if (!selected) {
    return (
      <ChartFrame>
        <ChartHeader
          title="Вывоз на захоронение"
          description="Выберите отход в таблице, чтобы увидеть помесячный факт."
        />
        <ChartEmpty>Нет выбранной пары разрешение / отход.</ChartEmpty>
      </ChartFrame>
    );
  }

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <ChartFrame>
        <ChartHeader title="Вывоз на захоронение" />
        <ChartEmpty>
          {notFound
            ? "Разрешение или отход не найдены в организации."
            : error.message}
        </ChartEmpty>
      </ChartFrame>
    );
  }

  if (loading && !stat) {
    return (
      <ChartFrame>
        <ChartHeader title="Вывоз на захоронение" />
        <ChartEmpty>Загрузка…</ChartEmpty>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame>
      <ChartHeader
        title="Вывоз на захоронение"
        description={
          stat
            ? `${stat.permit.number} · ${unitLabel(stat.permit.unit)} · ${wasteTitle(stat.waste)}`
            : undefined
        }
        amount={
          stat ? (
            <>
              <span
                className={yearOverLimit ? "text-destructive" : undefined}
                title={
                  yearOverLimit
                    ? "Факт за год выше лимита разрешения"
                    : undefined
                }
              >
                {formatBalanceAmount(String(yearTotal))}
              </span>
              {` / ${formatBalanceAmount(stat.limit)} ${uom}`}
            </>
          ) : undefined
        }
        note={stat ? BURIAL_PERMIT_LIMIT_CAPTION : undefined}
      />
      <div
        className="h-72 w-full min-w-0"
        role="img"
        aria-label="Вывоз на захоронение по месяцам"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
              cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }}
              content={(props) => (
                <BurialTooltip
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
  );
}
