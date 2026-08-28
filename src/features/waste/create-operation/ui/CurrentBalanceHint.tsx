import { useCurrentBalanceQuery } from "../../../../entities/waste/operations";
import { cn } from "../../../../shared/lib/cn";
import { Alert, AlertDescription } from "../../../../shared/ui";
import {
  fillPercent,
  fillTone,
  formatFillPercent,
} from "../model/fill-percent";

type CurrentBalanceHintProps = {
  tenantId: string | null;
  unitId: string;
  wasteId: string;
  uomLabel?: string;
  /** Ёмкость привязки (UIW `transport_unit`). 0 / пусто — прогресс скрыт. */
  transportUnit?: string;
};

export function CurrentBalanceHint({
  tenantId,
  unitId,
  wasteId,
  uomLabel,
  transportUnit,
}: CurrentBalanceHintProps) {
  const enabled = Boolean(unitId && wasteId);
  const { balance, loading, error } = useCurrentBalanceQuery({
    tenantId,
    unitId,
    wasteId,
    enabled,
  });

  if (!enabled) return null;

  const text = loading
    ? "Загрузка текущего остатка…"
    : error
      ? "Не удалось загрузить текущий остаток"
      : balance
        ? `Текущий остаток: ${balance.amount}${uomLabel ? ` ${uomLabel}` : ""}`
        : null;

  const percent =
    balance && !loading && !error
      ? fillPercent(balance.amount, transportUnit ?? "")
      : null;
  const tone = percent === null ? null : fillTone(percent);

  if (!text) return null;

  return (
    <Alert variant="info">
      <AlertDescription>
        <p>{text}</p>
        {percent !== null && tone ? (
          <div className="grid gap-1.5 pt-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span>Заполненность</span>
              <span
                className={
                  tone === "danger"
                    ? "text-destructive"
                    : "text-warning-foreground"
                }
              >
                {formatFillPercent(percent)}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(percent, 100)}
              aria-label={`Заполненность ${formatFillPercent(percent)} процентов`}
              className="h-2 overflow-hidden rounded-full bg-background/60"
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
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
