import type {
  Notification,
  NotificationSeverity,
} from "../../../../entities/notifications";

const SEVERITY_RANK: Record<NotificationSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

/** `critical`, затем `warning`, затем `info`. Внутри группы порядок ответа API сохраняется. */
export function sortNotificationsBySeverity(
  items: readonly Notification[],
): Notification[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const bySeverity =
        SEVERITY_RANK[left.item.severity] - SEVERITY_RANK[right.item.severity];
      return bySeverity !== 0 ? bySeverity : left.index - right.index;
    })
    .map(({ item }) => item);
}
