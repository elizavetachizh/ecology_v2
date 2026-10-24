import { useQuery } from "@tanstack/react-query";
import { getDashboardFormed } from "../api/get-dashboard-formed";
import { dashboardsQueryKeys } from "./dashboards-query-keys";
import type { GetDashboardFormedParams } from "./dashboards.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseDashboardFormedQueryArgs = {
  tenantId: string | null;
  params: GetDashboardFormedParams;
  enabled?: boolean;
};

export function useDashboardFormedQuery({
  tenantId,
  params,
  enabled = true,
}: UseDashboardFormedQueryArgs) {
  const canFetch = Boolean(tenantId && params.year) && enabled;

  const query = useQuery({
    queryKey: dashboardsQueryKeys.formed(tenantId ?? "none", params),
    queryFn: ({ signal }) => getDashboardFormed(params, signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    groups: query.data ?? [],
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    ready: query.isSuccess,
    error: query.error,
    refetch: query.refetch,
  };
}
