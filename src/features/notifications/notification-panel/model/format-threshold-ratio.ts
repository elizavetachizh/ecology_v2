type ThresholdPayload = {
  amount?: string;
  transport_unit?: string;
  ratio?: string;
};

export type ThresholdFill = {
  /** Округлённый процент. При доле больше 1 — больше 100. */
  percent: number;
  /** «85%» или «124%». */
  percentLabel: string;
  /** Ширина полосы, 0–100. При доле больше 1 полоса полная. */
  barPercent: number;
  amountLabel: string;
  transportUnitLabel: string;
};

function formatPayloadAmount(value: string | undefined): string {
  if (!value?.trim()) return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  return amount.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
}

function parseRatio(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const ratio = Number(value);
  if (!Number.isFinite(ratio) || ratio < 0) return null;
  return ratio;
}

/** Числа полосы из `payload`: количество и лимит в ru-RU, доля — как процент. */
export function formatThresholdFill(
  payload: ThresholdPayload,
): ThresholdFill | null {
  const ratio = parseRatio(payload.ratio);
  if (ratio === null) return null;

  const percent = Math.round(ratio * 100);
  return {
    percent,
    percentLabel: `${percent.toLocaleString("ru-RU")}%`,
    barPercent: Math.min(percent, 100),
    amountLabel: formatPayloadAmount(payload.amount),
    transportUnitLabel: formatPayloadAmount(payload.transport_unit),
  };
}
