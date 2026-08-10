import { useQuery } from "@tanstack/react-query";
import type { GetUnitsParams } from "./units.types";
import { getUnits } from "../api/get-units";
import { unitsQueryKeys } from "./unit-query-keys";

type UseUnitsListQueryArgs = {
  tenantId: string | null;
  params: GetUnitsParams;
  enabled?: boolean;
};

export function useUnitsListQuery({
  tenantId,
  params,
  enabled = true,
}: UseUnitsListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: unitsQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getUnits(params, signal),
    enabled: canFetch,
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
