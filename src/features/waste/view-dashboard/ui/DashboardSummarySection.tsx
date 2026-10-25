import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Truck,
  type LucideIcon,
} from "lucide-react";
import {
  type DashboardSummary,
  type DashboardSummaryOpen,
  type SummaryPreset,
} from "../../../../entities/waste/dashboards";
import { cn } from "../../../../shared/lib/cn";
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

type PeriodKey = "operations" | "passports" | "ttns";

const SUMMARY_CARDS: {
  periodKey: PeriodKey;
  openKey: keyof DashboardSummaryOpen;
  label: string;
  queuePhrase: string;
  icon: LucideIcon;
}[] = [
  {
    periodKey: "operations",
    openKey: "operations_confirmation_required",
    label: "Подтверждённые операции",
    queuePhrase: "ожидают подтверждения",
    icon: ClipboardList,
  },
  {
    periodKey: "passports",
    openKey: "passports_without_transfer",
    label: "Паспорта",
    queuePhrase: "без вывоза",
    icon: FileText,
  },
  {
    periodKey: "ttns",
    openKey: "ttns_without_transfer",
    label: "ТТН",
    queuePhrase: "без вывоза",
    icon: Truck,
  },
];

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
  const countersLoading = loading && !summary;

  return (
    <div className="space-y-4">
      <PageContextBar
        sticky={false}
        title="Сводка"
        description="Подтверждённые операции, паспорта и ТТН за выбранный период."
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
            {SUMMARY_CARDS.map((card) => (
              <SummaryCounter
                key={card.periodKey}
                label={card.label}
                queuePhrase={card.queuePhrase}
                icon={card.icon}
                periodValue={summary ? summary.period[card.periodKey] : null}
                openValue={summary ? summary.open[card.openKey] : null}
                loading={countersLoading}
              />
            ))}
          </div>

          <DashboardSummaryTable
            rows={summary?.period.operations_by_unit ?? []}
            loading={countersLoading}
          />
        </>
      ) : null}
    </div>
  );
}

function formatCounter(value: number | null, loading: boolean): string {
  if (loading) return "…";
  if (value === null) return "—";
  return value.toLocaleString("ru-RU");
}

function SummaryCounter({
  label,
  queuePhrase,
  icon: Icon,
  periodValue,
  openValue,
  loading,
}: {
  label: string;
  queuePhrase: string;
  icon: LucideIcon;
  periodValue: number | null;
  openValue: number | null;
  loading: boolean;
}) {
  const openKnown = !loading && openValue !== null;
  const hasQueue = openKnown && openValue > 0;
  const queueTone = hasQueue ? "text-warning-foreground" : "text-success";

  return (
    <div
      className={cn(
        "rounded-xl border bg-card px-4 py-3",
        hasQueue ? "border-warning/40" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-2xl font-semibold tabular-nums text-foreground">
          {formatCounter(periodValue, loading)}
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            openKnown
              ? hasQueue
                ? "bg-warning-muted text-warning"
                : "bg-info-muted text-info"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-1.5 text-sm">
        {hasQueue ? (
          <AlertTriangle
            className="size-3.5 shrink-0 text-warning"
            aria-hidden
          />
        ) : openKnown ? (
          <CheckCircle2
            className="size-3.5 shrink-0 text-success"
            aria-hidden
          />
        ) : null}
        {openKnown ? (
          <span>
            <span className={cn("font-medium tabular-nums", queueTone)}>
              {formatCounter(openValue, false)}
            </span>{" "}
            <span className={queueTone}>{queuePhrase}</span>{" "}
          </span>
        ) : (
          <span className="text-muted-foreground">
            {formatCounter(openValue, loading)}
          </span>
        )}
      </div>
    </div>
  );
}
