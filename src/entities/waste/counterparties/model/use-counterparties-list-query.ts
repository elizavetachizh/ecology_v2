import { useQuery } from "@tanstack/react-query";
import { getCounterparties } from "../api/get-counterparties";
import type { GetCounterpartiesParams } from "./counterparties.types";
import { counterpartiesQueryKeys } from "./counterparties-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseCounterpartiesListQueryArgs = {
  tenantId: string | null;
  params: GetCounterpartiesParams;
  enabled?: boolean;
};

export function useCounterpartiesListQuery({
  tenantId,
  params,
  enabled = true,
}: UseCounterpartiesListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: counterpartiesQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getCounterparties(params, signal),
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
