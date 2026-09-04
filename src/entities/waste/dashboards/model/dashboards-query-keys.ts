import type {
  GetDashboardBalanceParams,
  GetDashboardBalanceStatParams,
  GetDashboardBurialPermitStatParams,
  GetDashboardBurialPermitsParams,
} from "./dashboards.types";

export const dashboardsQueryKeys = {
  all: ["dashboards"] as const,
  balances: () => [...dashboardsQueryKeys.all, "balance"] as const,
  balance: (tenantId: string, params: GetDashboardBalanceParams) =>
    [...dashboardsQueryKeys.balances(), tenantId, params] as const,
  stats: () => [...dashboardsQueryKeys.all, "stat"] as const,
  stat: (tenantId: string, params: GetDashboardBalanceStatParams) =>
    [...dashboardsQueryKeys.stats(), tenantId, params] as const,
  burialPermits: () => [...dashboardsQueryKeys.all, "burial-permits"] as const,
  burialPermit: (tenantId: string, params: GetDashboardBurialPermitsParams) =>
    [...dashboardsQueryKeys.burialPermits(), tenantId, params] as const,
  burialPermitStats: () =>
    [...dashboardsQueryKeys.all, "burial-permit-stat"] as const,
  burialPermitStat: (
    tenantId: string,
    params: GetDashboardBurialPermitStatParams,
  ) => [...dashboardsQueryKeys.burialPermitStats(), tenantId, params] as const,
};
