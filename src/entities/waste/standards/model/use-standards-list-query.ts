import { useQuery } from "@tanstack/react-query";
import type { GetStandardsParams } from "./standards.types";
import { standardsQueryKeys } from "./standards-query-keys";
import { getStandards } from "../api/get-standards";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseStandardsListQueryArgs = {
  tenantId: string | null;
  params: GetStandardsParams;
  enabled?: boolean;
};

export function useStandardsListQuery({
  tenantId,
  params,
  enabled = true,
}: UseStandardsListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;
  const query = useQuery({
    queryKey: standardsQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getStandards(params, signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });
  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    limit: query.data?.limit ?? params.limit,
    offset: query.data?.offset ?? params.offset,
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
