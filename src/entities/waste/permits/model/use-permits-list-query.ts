import { useQuery } from "@tanstack/react-query";
import type { GetPermitsParams } from "./permits.types";
import { permitsQueryKeys } from "./permits-query-keys";
import { getPermits } from "../api/get-permits";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UsePermitsListQueryArgs = {
  tenantId: string | null;
  params: GetPermitsParams;
  enabled?: boolean;
};

export function usePermitsListQuery({
  tenantId,
  params,
  enabled = true,
}: UsePermitsListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;
  const query = useQuery({
    queryKey: permitsQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getPermits(params, signal),
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
