import type { GetNotificationsParams } from "./notifications.types";

export const NOTIFICATIONS_REFETCH_INTERVAL_MS = 60_000;

export const notificationsQueryKeys = {
  all: ["notifications"] as const,
  summary: (tenantId: string) =>
    [...notificationsQueryKeys.all, "summary", tenantId] as const,
  list: (tenantId: string, params: GetNotificationsParams) =>
    [...notificationsQueryKeys.all, "list", tenantId, params] as const,
};
