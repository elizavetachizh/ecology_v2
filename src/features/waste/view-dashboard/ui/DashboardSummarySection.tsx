import type { ReactNode } from "react";
import {
  type DashboardSummary,
  type SummaryPreset,
} from "../../../../entities/waste/dashboards";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  PageContextBar,
} from "../../../../shared/ui";
import { DashboardSummaryFilters } from "./DashboardSummaryFilters";
import { DashboardSummaryTable } from "./DashboardSummaryTable";

type DashboardSummarySectionProps = {
  preset: SummaryPreset;
  dateFrom?: string;
  dateTo?: string;
  summary: DashboardSummary | null;
  loading: boolean;
  error: Error | null;
  rangeError: string | null;
  onPresetChange: (preset: SummaryPreset) => void;
  onRangeChange: (range: { date_from?: string; date_to?: string }) => void;
};

const PERIOD_COUNTERS = [
  { key: "operations", label: "Подтверждённые операции" },
  { key: "passports", label: "Паспорта" },
  { key: "ttns", label: "ТТН" },
] as const;

const OPEN_COUNTERS = [
  {
    key: "operations_confirmation_required",
    label: "Операции на подтверждении",
  },
  { key: "passports_without_transfer", label: "Паспорта без вывоза" },
  { key: "ttns_without_transfer", label: "ТТН без вывоза" },
] as const;

export function DashboardSummarySection({
  preset,
  dateFrom,
  dateTo,
  summary,
  loading,
  error,
  rangeError,
  onPresetChange,
  onRangeChange,
}: DashboardSummarySectionProps) {
  const showData = !rangeError && !error;

  return (
    <div className="space-y-4">
      <PageContextBar
        sticky={false}
        title="Сводка"
        description="Подтверждённые операции, паспорта и ТТН за выбранное окно. Очереди ниже считаются на текущий момент."
        actions={
          <div className="flex flex-col gap-2 sm:items-end">
            <DashboardSummaryFilters
              values={{ preset, dateFrom, dateTo }}
              onPresetChange={onPresetChange}
              onRangeChange={onRangeChange}
            />

            {rangeError ? (
              <p className="text-sm text-destructive">{rangeError}</p>
            ) : null}
          </div>
        }
      />

      {error ? (
        <Alert variant="error">
          <AlertTitle>Не удалось загрузить сводку</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {showData ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {PERIOD_COUNTERS.map((counter) => (
              <SummaryCounter
                key={counter.key}
                label={counter.label}
                value={summary ? summary.period[counter.key] : null}
                loading={loading && !summary}
              />
            ))}
          </div>

          <DashboardSummaryTable
            rows={summary?.period.operations_by_unit ?? []}
            loading={loading && !summary}
          />

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">Сейчас</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {OPEN_COUNTERS.map((counter) => (
                <SummaryCounter
                  key={counter.key}
                  label={counter.label}
                  value={summary ? summary.open[counter.key] : null}
                  loading={loading && !summary}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function SummaryCounter({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | null;
  loading: boolean;
}) {
  let display: ReactNode = "—";
  if (loading) display = "…";
  else if (value !== null) display = value.toLocaleString("ru-RU");

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="text-2xl font-semibold tabular-nums text-foreground">
        {display}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
