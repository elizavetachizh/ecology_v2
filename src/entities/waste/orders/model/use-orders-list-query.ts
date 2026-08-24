import { useQuery } from "@tanstack/react-query";
import type { GetOrdersParams } from "./orders.types";
import { ordersQueryKeys } from "./orders-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";
import { getOrders } from "../api/get-orders";

type UseOrdersListQueryArgs = {
  tenantId: string | null;
  params: GetOrdersParams;
  enabled?: boolean;
};

export function useOrdersListQuery({
  tenantId,
  params,
  enabled = true,
}: UseOrdersListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: ordersQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getOrders(params, signal),
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
