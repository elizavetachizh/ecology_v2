import { useQuery } from "@tanstack/react-query";
import { getOperations } from "../api/get-operations";
import { operationsQueryKeys } from "./operations-query-keys";
import type { GetOperationsParams } from "./operations.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseOperationsListQueryArgs = {
  tenantId: string | null;
  params: GetOperationsParams;
  enabled?: boolean;
};

export function useOperationsListQuery({
  tenantId,
  params,
  enabled = true,
}: UseOperationsListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: operationsQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getOperations(params, signal),
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
