import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../api/get-dashboard-summary";
import { dashboardsQueryKeys } from "./dashboards-query-keys";
import type { GetDashboardSummaryParams } from "./dashboards.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseDashboardSummaryQueryArgs = {
  tenantId: string | null;
  params: GetDashboardSummaryParams;
  enabled?: boolean;
};

export function useDashboardSummaryQuery({
  tenantId,
  params,
  enabled = true,
}: UseDashboardSummaryQueryArgs) {
  const canFetch =
    Boolean(tenantId && params.date_from && params.date_to) && enabled;

  const query = useQuery({
    queryKey: dashboardsQueryKeys.summary(tenantId ?? "none", params),
    queryFn: ({ signal }) => getDashboardSummary(params, signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    summary: query.data ?? null,
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
