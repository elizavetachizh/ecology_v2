import { useQuery } from "@tanstack/react-query";
import { getDashboardBurialPermits } from "../api/get-dashboard-burial-permits";
import { dashboardsQueryKeys } from "./dashboards-query-keys";
import type { GetDashboardBurialPermitsParams } from "./dashboards.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseDashboardBurialPermitsQueryArgs = {
  tenantId: string | null;
  params: GetDashboardBurialPermitsParams;
  enabled?: boolean;
};

export function useDashboardBurialPermitsQuery({
  tenantId,
  params,
  enabled = true,
}: UseDashboardBurialPermitsQueryArgs) {
  const canFetch = Boolean(tenantId && params.year) && enabled;

  const query = useQuery({
    queryKey: dashboardsQueryKeys.burialPermit(tenantId ?? "none", params),
    queryFn: ({ signal }) => getDashboardBurialPermits(params, signal),
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
