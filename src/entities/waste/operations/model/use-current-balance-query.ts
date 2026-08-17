import { useQuery } from "@tanstack/react-query";
import { getCurrentBalance } from "../api/get-current-balance";
import { operationsQueryKeys } from "./operations-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseCurrentBalanceQueryArgs = {
  tenantId: string | null;
  unitId?: string;
  wasteId?: string;
  enabled?: boolean;
};

export function useCurrentBalanceQuery({
  tenantId,
  unitId,
  wasteId,
  enabled = true,
}: UseCurrentBalanceQueryArgs) {
  const canFetch = Boolean(tenantId && unitId && wasteId) && enabled;

  const query = useQuery({
    queryKey: operationsQueryKeys.currentBalance(
      tenantId ?? "none",
      unitId ?? "",
      wasteId ?? "",
    ),
    queryFn: ({ signal }) =>
      getCurrentBalance({ unit_id: unitId!, waste_id: wasteId! }, signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    balance: query.data ?? null,
    loading: canFetch && query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
