import { useQuery } from "@tanstack/react-query";
import { getDashboardFormedStat } from "../api/get-dashboard-formed-stat";
import { dashboardsQueryKeys } from "./dashboards-query-keys";
import type { GetDashboardFormedStatParams } from "./dashboards.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseDashboardFormedStatQueryArgs = {
  tenantId: string | null;
  params: GetDashboardFormedStatParams;
  enabled?: boolean;
};

export function useDashboardFormedStatQuery({
  tenantId,
  params,
  enabled = true,
}: UseDashboardFormedStatQueryArgs) {
  const canFetch =
    Boolean(tenantId && params.year && params.waste_id) && enabled;

  const query = useQuery({
    queryKey: dashboardsQueryKeys.formedStat(tenantId ?? "none", params),
    queryFn: ({ signal }) => getDashboardFormedStat(params, signal),
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
