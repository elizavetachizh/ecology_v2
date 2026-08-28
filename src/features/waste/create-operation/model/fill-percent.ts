/** Порог, выше которого заполненность считается критической. */
export const FILL_WARN_PERCENT = 85;

export type FillTone = "warning" | "danger";

/** `остаток * 100 / transport_unit`. `null`, если ёмкость не задана или некорректна. */
export function fillPercent(
  balanceAmount: string,
  transportUnit: string,
): number | null {
  if (!balanceAmount.trim() || !transportUnit.trim()) return null;
  const capacity = Number(transportUnit);
  const current = Number(balanceAmount);
  if (!Number.isFinite(capacity) || capacity <= 0) return null;
  if (!Number.isFinite(current) || current < 0) return null;
  return (current * 100) / capacity;
}

export function fillTone(percent: number): FillTone {
  return percent > FILL_WARN_PERCENT ? "danger" : "warning";
}

export function formatFillPercent(percent: number): string {
  const rounded = Math.round(percent * 10) / 10;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(1).replace(".", ",");
}
