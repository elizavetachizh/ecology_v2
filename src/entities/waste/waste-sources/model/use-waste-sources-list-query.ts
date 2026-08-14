import { useQuery } from "@tanstack/react-query";
import { getWasteSources } from "../api/get-waste-sources";
import type { GetWasteSourcesParams } from "./waste-sources.types";
import { wasteSourcesQueryKeys } from "./waste-sources-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseWasteSourcesListQueryArgs = {
  tenantId: string | null;
  params: GetWasteSourcesParams;
  enabled?: boolean;
};

export function useWasteSourcesListQuery({
  tenantId,
  params,
  enabled = true,
}: UseWasteSourcesListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: wasteSourcesQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getWasteSources(params, signal),
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
