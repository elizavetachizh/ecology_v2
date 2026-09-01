import { useQuery } from "@tanstack/react-query";
import { getPassports } from "../api/get-passports";
import { passportsQueryKeys } from "./passports-query-keys";
import type { GetPassportsParams } from "./passports.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UsePassportsListQueryArgs = {
  tenantId: string | null;
  params: GetPassportsParams;
  enabled?: boolean;
};

export function usePassportsListQuery({
  tenantId,
  params,
  enabled = true,
}: UsePassportsListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: passportsQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getPassports(params, signal),
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
    refreshing: canFetch && query.isFetching && !query.isLoading,
  };
}
