import { useCurrentBalanceQuery } from "../../../../entities/waste/operations";
import { Alert, AlertDescription } from "../../../../shared/ui";

type CurrentBalanceHintProps = {
  tenantId: string | null;
  unitId: string;
  wasteId: string;
  uomLabel?: string;
};

export function CurrentBalanceHint({
  tenantId,
  unitId,
  wasteId,
  uomLabel,
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

  if (!text) return null;

  return (
    <Alert variant="info">
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
}
