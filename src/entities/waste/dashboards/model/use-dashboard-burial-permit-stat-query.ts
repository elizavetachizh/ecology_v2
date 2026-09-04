import { useQuery } from "@tanstack/react-query";
import { getDashboardBurialPermitStat } from "../api/get-dashboard-burial-permit-stat";
import { dashboardsQueryKeys } from "./dashboards-query-keys";
import type { GetDashboardBurialPermitStatParams } from "./dashboards.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseDashboardBurialPermitStatQueryArgs = {
  tenantId: string | null;
  params: GetDashboardBurialPermitStatParams;
  enabled?: boolean;
};

export function useDashboardBurialPermitStatQuery({
  tenantId,
  params,
  enabled = true,
}: UseDashboardBurialPermitStatQueryArgs) {
  const canFetch =
    Boolean(tenantId && params.year && params.permit_id && params.waste_id) &&
    enabled;

  const query = useQuery({
    queryKey: dashboardsQueryKeys.burialPermitStat(tenantId ?? "none", params),
    queryFn: ({ signal }) => getDashboardBurialPermitStat(params, signal),
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
