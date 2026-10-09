import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "../api/get-vehicles";
import type { GetVehiclesParams } from "./vehicles.types";
import { vehiclesQueryKeys } from "./vehicles-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseVehiclesListQueryArgs = {
  tenantId: string | null;
  params: GetVehiclesParams;
  enabled?: boolean;
};

export function useVehiclesListQuery({
  tenantId,
  params,
  enabled = true,
}: UseVehiclesListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: vehiclesQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getVehicles(params, signal),
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
