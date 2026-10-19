import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../api/get-notifications";
import { notificationsQueryKeys } from "./notifications-query-keys";
import type { GetNotificationsParams } from "./notifications.types";
import { DEFAULT_STALE_TIME_MS } from "../../../shared/lib/query-client";

type UseNotificationsListQueryArgs = {
  tenantId: string | null;
  params: GetNotificationsParams;
  /** Список не запрашивается, пока панель закрыта. */
  enabled?: boolean;
};

export function useNotificationsListQuery({
  tenantId,
  params,
  enabled = true,
}: UseNotificationsListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: notificationsQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getNotifications(params, signal),
    enabled: canFetch,
    staleTime: 5 * DEFAULT_STALE_TIME_MS,
    refetchInterval: 5 * DEFAULT_STALE_TIME_MS,
    refetchOnWindowFocus: true,
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
