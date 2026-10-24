import { toIsoDate } from "../../../../shared/lib/format-date";
import { unitLabel } from "../../units";
import { wasteLabel, type WasteBrief } from "../../wastes";
import type {
  DashboardBalance,
  DashboardBalancePoint,
  DashboardBalanceRow,
  DashboardBurialPermit,
  DashboardChartPoint,
  DashboardFormed,
  DashboardFormedMonth,
  DashboardFormedMonthPoint,
  DashboardFormedUnit,
  DashboardFormedUnitPoint,
} from "./dashboards.types";

export function formatBalanceAmount(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
}

export function isNonZeroAmount(amount: string): boolean {
  const n = Number(amount);
  return Number.isFinite(n) && n !== 0;
}

export function isAmountOverLimit(
  amount: string | number,
  limit: string,
): boolean {
  const fact = typeof amount === "number" ? amount : Number(amount);
  const cap = Number(limit);
  return Number.isFinite(fact) && Number.isFinite(cap) && fact > cap;
}

export function wasteTitle(
  waste: Pick<WasteBrief, "waste_classifier">,
): string {
  return wasteLabel(waste);
}

export function flattenDashboardBalance(
  groups: DashboardBalance[],
): DashboardBalanceRow[] {
  return groups.flatMap((group) =>
    group.wastes.map((item) => ({
      id: `${group.unit.id}:${item.waste.id}`,
      unit: group.unit,
      waste: item.waste,
      amount: item.amount,
    })),
  );
}

export function toChartPoints(
  points: DashboardBalancePoint[],
): DashboardChartPoint[] {
  return points.map((point) => {
    const amount = Number(point.amount);
    return {
      date: point.date,
      amount: Number.isFinite(amount) ? amount : 0,
    };
  });
}

export function firstDashboardSelection(
  groups: DashboardBalance[],
): { unit_id: string; waste_id: string } | null {
  for (const group of groups) {
    const item =
      group.wastes.find((waste) => isNonZeroAmount(waste.amount)) ??
      group.wastes[0];
    if (item) return { unit_id: group.unit.id, waste_id: item.waste.id };
  }
  return null;
}

export function yearFromIsoDate(isoDate: string, fallbackYear: number): number {
  const year = Number(isoDate.slice(0, 4));
  return Number.isInteger(year) ? year : fallbackYear;
}

export function currentCalendarYear(now = new Date()): number {
  return now.getFullYear();
}

export const SUMMARY_PRESET_VALUES = [
  "this_day",
  "this_week",
  "this_month",
  "this_year",
  "custom",
] as const;

export type SummaryPreset = (typeof SUMMARY_PRESET_VALUES)[number];

export const DEFAULT_SUMMARY_PRESET: SummaryPreset = "this_month";

export const SUMMARY_PRESET_LABEL: Record<SummaryPreset, string> = {
  this_day: "Сегодня",
  this_week: "Эта неделя",
  this_month: "Этот месяц",
  this_year: "Этот год",
  custom: "Период",
};

export type SummaryDateRange = {
  date_from: string;
  date_to: string;
};

export type SummaryRangeResolution = {
  date_from?: string;
  date_to?: string;
  error: string | null;
};

/** Calendar window for a named preset. Week is Monday–Sunday, local date. */
export function summaryPresetRange(
  preset: Exclude<SummaryPreset, "custom">,
  now = new Date(),
): SummaryDateRange {
  if (preset === "this_day") {
    const day = toIsoDate(now);
    return { date_from: day, date_to: day };
  }

  if (preset === "this_week") {
    const mondayOffset = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      date_from: toIsoDate(monday),
      date_to: toIsoDate(sunday),
    };
  }

  if (preset === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      date_from: toIsoDate(start),
      date_to: toIsoDate(end),
    };
  }

  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31);
  return {
    date_from: toIsoDate(start),
    date_to: toIsoDate(end),
  };
}

/**
 * Named presets always have a window. Custom is ready only when both dates
 * are set and `date_from <= date_to` (the API answers 400 otherwise).
 */
export function resolveSummaryRange(
  preset: SummaryPreset,
  customFrom: string | undefined,
  customTo: string | undefined,
  now = new Date(),
): SummaryRangeResolution {
  if (preset !== "custom") {
    return { ...summaryPresetRange(preset, now), error: null };
  }
  if (!customFrom || !customTo) {
    return {
      date_from: customFrom,
      date_to: customTo,
      error: "Укажите начало и конец периода",
    };
  }
  if (customFrom > customTo) {
    return {
      date_from: customFrom,
      date_to: customTo,
      error: "Дата начала позже даты окончания",
    };
  }
  return { date_from: customFrom, date_to: customTo, error: null };
}

export function firstBurialPermitSelection(
  groups: DashboardBurialPermit[],
): { permit_id: string; waste_id: string } | null {
  for (const group of groups) {
    const item =
      group.wastes.find((waste) => isNonZeroAmount(waste.amount)) ??
      group.wastes[0];
    if (item) {
      return { permit_id: group.permit.id, waste_id: item.waste.id };
    }
  }
  return null;
}

export function sumChartAmounts(points: DashboardBalancePoint[]): number {
  return toChartPoints(points).reduce((sum, point) => sum + point.amount, 0);
}

export function firstFormedSelection(
  rows: DashboardFormed[],
): { waste_id: string } | null {
  const row = rows.find((item) => isNonZeroAmount(item.amount)) ?? rows[0];
  if (!row) return null;
  return { waste_id: row.waste.id };
}

function chartAmount(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function toFormedUnitPoints(
  units: DashboardFormedUnit[],
): DashboardFormedUnitPoint[] {
  return units.map((item) => ({
    name: unitLabel(item.unit),
    amount: chartAmount(item.amount),
  }));
}

export function toFormedMonthPoints(
  months: DashboardFormedMonth[],
): DashboardFormedMonthPoint[] {
  return months.map((item) => ({
    month: item.month,
    current: chartAmount(item.current_amount),
    previous: chartAmount(item.previous_amount),
  }));
}
