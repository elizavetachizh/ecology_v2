import { useQuery } from "@tanstack/react-query";
import { getDashboardBalanceStat } from "../api/get-dashboard-balance-stat";
import { dashboardsQueryKeys } from "./dashboards-query-keys";
import type { GetDashboardBalanceStatParams } from "./dashboards.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseDashboardBalanceStatQueryArgs = {
  tenantId: string | null;
  params: GetDashboardBalanceStatParams;
  enabled?: boolean;
};

export function useDashboardBalanceStatQuery({
  tenantId,
  params,
  enabled = true,
}: UseDashboardBalanceStatQueryArgs) {
  const canFetch =
    Boolean(tenantId && params.on_date && params.unit_id && params.waste_id) &&
    enabled;

  const query = useQuery({
    queryKey: dashboardsQueryKeys.stat(tenantId ?? "none", params),
    queryFn: ({ signal }) => getDashboardBalanceStat(params, signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    stat: query.data ?? null,
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
