import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { fillTone, formatFillPercent } from "../lib/fill-percent";

export type FillMeterProps = {
  percent: number;
  /** Левая подпись. По умолчанию «Заполненность». */
  leading?: ReactNode;
};

export function FillMeter({
  percent,
  leading = "Заполненность",
}: FillMeterProps) {
  const tone = fillTone(percent);
  const label = formatFillPercent(percent);

  return (
    <div data-slot="fill-meter" className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span>{leading}</span>
        <span
          className={
            tone === "danger" ? "text-destructive" : "text-warning-foreground"
          }
        >
          {label}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(percent, 100)}
        aria-label={`Заполненность ${label} процентов`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full",
            tone === "danger" ? "bg-destructive" : "bg-warning",
          )}
          style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
