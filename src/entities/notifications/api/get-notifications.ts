import { apiJson } from "../../../shared/api/api-client";
import type {
  GetNotificationsParams,
  NotificationListResponse,
} from "../model/notifications.types";

export function getNotifications(
  params: GetNotificationsParams,
  signal?: AbortSignal,
): Promise<NotificationListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.status) searchParams.set("status", params.status);
  if (params.severity) searchParams.set("severity", params.severity);
  if (params.code) searchParams.set("code", params.code);
  return apiJson<NotificationListResponse>(
    `/api/v1/notifications?${searchParams}`,
    {
      signal,
      tenantScoped: true,
    },
  );
}
