import { useQuery } from "@tanstack/react-query";
import { ordersQueryKeys } from "./orders-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";
import { getUnitResponsible } from "../api/get-unit-responsible";

type UseUnitResponsibleQueryArgs = {
  tenantId: string | null;
  unitId?: string;
  on?: string;
  enabled?: boolean;
};

export function useUnitResponsibleQuery({
  tenantId,
  unitId,
  on,
  enabled = true,
}: UseUnitResponsibleQueryArgs) {
  const canFetch = Boolean(tenantId && unitId) && enabled;

  const query = useQuery({
    queryKey: ordersQueryKeys.unitResponsibleOn(tenantId ?? "none", {
      unitId: unitId ?? "",
      on,
    }),
    queryFn: ({ signal }) =>
      getUnitResponsible({ unitId: unitId!, on }, signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    responsible: query.data ?? null,
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
