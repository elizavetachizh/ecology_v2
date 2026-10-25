import { useCurrentBalanceQuery } from "../../../../entities/waste/operations";
import { fillPercent } from "../../../../shared/lib/fill-percent";
import { Alert, AlertDescription, FillMeter } from "../../../../shared/ui";

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

  const balanceText =
    balance && !loading && !error
      ? `Текущий остаток: ${balance.amount}${uomLabel ? ` ${uomLabel}` : ""}`
      : null;
  const text = loading
    ? "Загрузка текущего остатка…"
    : error
      ? "Не удалось загрузить текущий остаток"
      : balanceText;

  const percent = balance
    ? fillPercent(balance.amount, transportUnit ?? "")
    : null;

  if (!text) return null;

  return (
    <Alert variant="info">
      <AlertDescription>
        <p>
          {balanceText ? (
            <>
              <span>{balanceText}</span>
              {`. Лимит: ${transportUnit}`}
            </>
          ) : (
            text
          )}
        </p>
        {percent !== null ? (
          <div className="pt-2">
            <FillMeter percent={percent} />
          </div>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
