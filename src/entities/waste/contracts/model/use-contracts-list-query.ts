import { useQuery } from "@tanstack/react-query";
import type { GetContractsParams } from "./contracts.types";
import { contractsQueryKeys } from "./contracts-query-keys";
import { getContracts } from "../api/get-contracts";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseContractsListQueryArgs = {
  tenantId: string | null;
  params: GetContractsParams;
  enabled?: boolean;
};
export function useContractsListQuery({
  tenantId,
  params,
  enabled = true,
}: UseContractsListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;
  const query = useQuery({
    queryKey: contractsQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getContracts(params, signal),
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
