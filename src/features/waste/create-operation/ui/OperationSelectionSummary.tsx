type OperationSelectionSummaryProps = {
  dateLabel?: string;
  unitLabel?: string;
  wasteLabel?: string;
  wasteMeta?: string;
};

export function OperationSelectionSummary({
  dateLabel,
  unitLabel,
  wasteLabel,
  wasteMeta,
}: OperationSelectionSummaryProps) {
  if (!dateLabel && !unitLabel && !wasteLabel) return null;

  return (
    <dl className="grid gap-3 rounded-xl border border-border bg-muted/40 p-3 sm:grid-cols-2">
      {dateLabel ? (
        <div className="grid gap-1">
          <dt className="text-xs font-medium text-muted-foreground">Дата</dt>
          <dd className="text-sm text-foreground">{dateLabel}</dd>
        </div>
      ) : null}
      {unitLabel ? (
        <div className="grid gap-1">
          <dt className="text-xs font-medium text-muted-foreground">
            Место учёта
          </dt>
          <dd className="text-sm text-foreground">{unitLabel}</dd>
        </div>
      ) : null}
      {wasteLabel ? (
        <div className="grid gap-1">
          <dt className="text-xs font-medium text-muted-foreground">Отход</dt>
          <dd className="text-sm text-foreground">{wasteLabel}</dd>
          {wasteMeta ? (
            <dd className="text-xs text-muted-foreground">{wasteMeta}</dd>
          ) : null}
        </div>
      ) : null}
    </dl>
  );
}
