import type { UnitBrief } from "../../units";
import type { WasteBrief } from "../../wastes";

export const DEFAULT_DASHBOARD_MONTHS = 6;
export const DASHBOARD_MONTHS_MIN = 1;
export const DASHBOARD_MONTHS_MAX = 24;
export const DASHBOARD_MONTHS_PRESETS = [3, 6, 12, 24] as const;

export type DashboardMonthsPreset = (typeof DASHBOARD_MONTHS_PRESETS)[number];

export type DashboardBalanceItem = {
  waste: WasteBrief;
  amount: string;
};

export type DashboardBalance = {
  unit: UnitBrief;
  wastes: DashboardBalanceItem[];
};

export type DashboardBalancePoint = {
  date: string;
  amount: string;
};

export type DashboardBalanceStat = {
  unit: UnitBrief;
  waste: WasteBrief;
  points: DashboardBalancePoint[];
};

export type GetDashboardBalanceParams = {
  on_date: string;
};

export type GetDashboardBalanceStatParams = {
  on_date: string;
  unit_id: string;
  waste_id: string;
  months?: number;
};

export type DashboardBalanceRow = {
  id: string;
  unit: UnitBrief;
  waste: WasteBrief;
  amount: string;
};

export type DashboardChartPoint = {
  date: string;
  amount: number;
};

export type DashboardBalanceSummary = {
  unitCount: number;
  wasteCount: number;
  nonZeroCount: number;
};
