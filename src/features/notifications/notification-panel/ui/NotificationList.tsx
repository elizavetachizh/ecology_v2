import { useMemo } from "react";
import {
  DEFAULT_NOTIFICATIONS_LIST_LIMIT,
  useNotificationsListQuery,
  type GetNotificationsParams,
  type NotificationStatus,
} from "../../../../entities/notifications";
import { Button } from "../../../../shared/ui";
import { sortNotificationsBySeverity } from "../model/sort-notifications";
import { NotificationItem } from "./NotificationItem";

type NotificationListProps = {
  tenantId: string | null;
  status: NotificationStatus;
  /** Список не запрашивается, пока панель закрыта. */
  enabled: boolean;
  onNavigate?: () => void;
};

export function NotificationList({
  tenantId,
  status,
  enabled,
  onNavigate,
}: NotificationListProps) {
  const params = useMemo<GetNotificationsParams>(
    () => ({
      status,
      limit: DEFAULT_NOTIFICATIONS_LIST_LIMIT,
      offset: 0,
    }),
    [status],
  );
  const { items, total, loading, error, refetch } = useNotificationsListQuery({
    tenantId,
    params,
    enabled,
  });
  const sorted = useMemo(() => sortNotificationsBySeverity(items), [items]);

  if (!tenantId) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted-foreground">
        Выберите организацию в верхней панели.
      </p>
    );
  }

  if (loading && items.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted-foreground">
        Загрузка…
      </p>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="grid justify-items-center gap-2 px-1 py-6 text-center">
        <p className="text-sm text-destructive">
          Не удалось загрузить уведомления
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
        >
          Повторить
        </Button>
      </div>
    );
  }

  if (sorted.length === 0) {
    const resolved = status === "resolved";
    return (
      <div className="px-1 py-6 text-center">
        <p className="text-sm font-medium text-foreground">Нет уведомлений</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {resolved
            ? "Здесь будут отображены уведомления для отходов, остаток которых < 85% лимита."
            : "Уведомление появится, когда остаток достигнет 85% лимита."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <ul className="grid max-h-[min(20rem,calc(100vh-8rem))] gap-2 overflow-y-auto">
        {sorted.map((notification) => (
          <li key={notification.id}>
            <NotificationItem
              notification={notification}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
      {total > items.length ? (
        <p className="text-center text-xs text-muted-foreground">
          Показаны {items.length} из {total}
        </p>
      ) : null}
    </div>
  );
}
