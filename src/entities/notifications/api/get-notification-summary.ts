import { apiJson } from "../../../shared/api/api-client";
import type { NotificationSummary } from "../model/notifications.types";

export function getNotificationSummary(
  signal?: AbortSignal,
): Promise<NotificationSummary> {
  return apiJson<NotificationSummary>("/api/v1/notifications/summary", {
    signal,
    tenantScoped: true,
  });
}
