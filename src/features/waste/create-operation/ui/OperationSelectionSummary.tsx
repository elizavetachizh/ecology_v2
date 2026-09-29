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
    <dl className="grid gap-3 rounded-xl border border-border bg-muted/40 p-3">
      {dateLabel ? (
        <div>
          <dd className="text-sm text-muted-foreground font-medium">
            {dateLabel} · {unitLabel}
          </dd>
        </div>
      ) : null}

      {wasteLabel ? (
        <div className="grid">
          <dd className="text-base text-foreground font-medium">
            {wasteLabel}
          </dd>
          {wasteMeta ? (
            <dd className="text-xs text-muted-foreground">{wasteMeta}</dd>
          ) : null}
        </div>
      ) : null}
    </dl>
  );
}
