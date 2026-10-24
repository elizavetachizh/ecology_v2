import { useQuery } from "@tanstack/react-query";
import { getPeriodLock } from "../api/get-period-lock";
import { operationsQueryKeys } from "./operations-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UsePeriodLockQueryArgs = {
  tenantId: string | null;
  enabled?: boolean;
};

export function usePeriodLockQuery({
  tenantId,
  enabled = true,
}: UsePeriodLockQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: operationsQueryKeys.periodLock(tenantId ?? "none"),
    queryFn: ({ signal }) => getPeriodLock(signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    periodLock: query.data ?? null,
    loading: canFetch && query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
