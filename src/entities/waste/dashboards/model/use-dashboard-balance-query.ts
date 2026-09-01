import { useQuery } from "@tanstack/react-query";
import { getDashboardBalance } from "../api/get-dashboard-balance";
import { dashboardsQueryKeys } from "./dashboards-query-keys";
import type { GetDashboardBalanceParams } from "./dashboards.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseDashboardBalanceQueryArgs = {
  tenantId: string | null;
  params: GetDashboardBalanceParams;
  enabled?: boolean;
};

export function useDashboardBalanceQuery({
  tenantId,
  params,
  enabled = true,
}: UseDashboardBalanceQueryArgs) {
  const canFetch = Boolean(tenantId && params.on_date) && enabled;

  const query = useQuery({
    queryKey: dashboardsQueryKeys.balance(tenantId ?? "none", params),
    queryFn: ({ signal }) => getDashboardBalance(params, signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    groups: query.data ?? [],
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
