import { useQuery } from "@tanstack/react-query";
import { getNotificationSummary } from "../api/get-notification-summary";
import {
  NOTIFICATIONS_REFETCH_INTERVAL_MS,
  notificationsQueryKeys,
} from "./notifications-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../shared/lib/query-client";

type UseNotificationSummaryQueryArgs = {
  tenantId: string | null;
};

export function useNotificationSummaryQuery({
  tenantId,
}: UseNotificationSummaryQueryArgs) {
  const canFetch = Boolean(tenantId);

  const query = useQuery({
    queryKey: notificationsQueryKeys.summary(tenantId ?? "none"),
    queryFn: ({ signal }) => getNotificationSummary(signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
    refetchInterval: NOTIFICATIONS_REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  return {
    summary: query.data ?? null,
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
