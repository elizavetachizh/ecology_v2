import { useQuery } from "@tanstack/react-query";
import { ordersQueryKeys } from "./orders-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";
import { getOrderStates } from "../api/get-order-states";

type UseOrderStatesQueryArgs = {
  tenantId: string | null;
  orderId?: string;
  enabled?: boolean;
};

export function useOrderStatesQuery({
  tenantId,
  orderId,
  enabled = true,
}: UseOrderStatesQueryArgs) {
  const canFetch = Boolean(tenantId && orderId) && enabled;

  const query = useQuery({
    queryKey: ordersQueryKeys.stateList(tenantId ?? "none", orderId ?? ""),
    queryFn: ({ signal }) => getOrderStates(orderId!, signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    items: query.data ?? [],
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
