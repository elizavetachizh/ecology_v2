import type { UnitBrief } from "../../units";
import { wasteLabel, type WasteBrief } from "../../wastes";
import type {
  DashboardBalance,
  DashboardBalancePoint,
  DashboardBalanceRow,
  DashboardBalanceSummary,
  DashboardBurialPermit,
  DashboardChartPoint,
} from "./dashboards.types";

export function todayIsoDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatBalanceAmount(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
}

export function isNonZeroAmount(amount: string): boolean {
  const n = Number(amount);
  return Number.isFinite(n) && n !== 0;
}

export function unitTitle(
  unit: Pick<UnitBrief, "name" | "short_name">,
): string {
  return unit.short_name ? `${unit.name} (${unit.short_name})` : unit.name;
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

export function summarizeDashboardBalance(
  groups: DashboardBalance[],
): DashboardBalanceSummary {
  const wasteCount = groups.reduce((n, group) => n + group.wastes.length, 0);
  const nonZeroCount = groups.reduce(
    (n, group) =>
      n + group.wastes.filter((item) => isNonZeroAmount(item.amount)).length,
    0,
  );
  return {
    unitCount: groups.length,
    wasteCount,
    nonZeroCount,
  };
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
