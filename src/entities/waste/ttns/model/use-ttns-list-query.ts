import { useQuery } from "@tanstack/react-query";
import { getTtns } from "../api/get-ttns";
import { ttnsQueryKeys } from "./ttns-query-keys";
import type { GetTtnsParams } from "./ttns.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseTtnsListQueryArgs = {
  tenantId: string | null;
  params: GetTtnsParams;
  enabled?: boolean;
};

export function useTtnsListQuery({
  tenantId,
  params,
  enabled = true,
}: UseTtnsListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: ttnsQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getTtns(params, signal),
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
