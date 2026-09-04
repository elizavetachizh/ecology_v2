import type { UnitBrief } from "../../units";
import type { WasteBrief } from "../../wastes";
import type { PermitStatus } from "../../permits";

export const DEFAULT_DASHBOARD_MONTHS = 6;
export const DASHBOARD_MONTHS_MIN = 1;
export const DASHBOARD_MONTHS_MAX = 24;
export const DASHBOARD_MONTHS_PRESETS = [3, 6, 12, 24] as const;
export const DASHBOARD_YEAR_MIN = 1900;
export const DASHBOARD_YEAR_MAX = 2100;

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

/** Permit brief nested in burial-permits dashboard reads. */
export type DashboardPermitBrief = {
  id: string;
  number: string;
  start_date: string;
  end_date: string | null;
  status: PermitStatus;
  unit: UnitBrief;
};

export type DashboardBurialPermitWaste = {
  waste: WasteBrief;
  amount: string;
  limit: string;
};

export type DashboardBurialPermit = {
  permit: DashboardPermitBrief;
  wastes: DashboardBurialPermitWaste[];
};

export type DashboardBurialPermitStat = {
  permit: DashboardPermitBrief;
  waste: WasteBrief;
  limit: string;
  points: DashboardBalancePoint[];
};

export type GetDashboardBurialPermitsParams = {
  year: number;
};

export type GetDashboardBurialPermitStatParams = {
  year: number;
  permit_id: string;
  waste_id: string;
};
