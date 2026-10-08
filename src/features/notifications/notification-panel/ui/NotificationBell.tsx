import { useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Bell } from "lucide-react";
import {
  useNotificationSummaryQuery,
  type NotificationStatus,
  type NotificationSummary,
} from "../../../../entities/notifications";
import { useTenant } from "../../../../entities/tenant";
import { cn } from "../../../../shared/lib/cn";
import { Badge, Button } from "../../../../shared/ui";
import { NotificationList } from "./NotificationList";

export function NotificationBell() {
  const { activeTenantId } = useTenant();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<NotificationStatus>("open");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setStatus("open");
  };
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useNotificationSummaryQuery({ tenantId: activeTenantId });

  const openCount = summary?.open ?? 0;
  const badgeVariant = (summary?.critical ?? 0) > 0 ? "destructive" : "warning";

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Уведомления"
        >
          <Bell size={32} />
          {openCount > 0 ? (
            <Badge
              variant={badgeVariant}
              className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px] leading-none"
            >
              {openCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          collisionPadding={8}
          className={cn(
            "z-50 w-[380px] max-w-[calc(100vw-1rem)] overflow-hidden rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
        >
          <div className="grid gap-2 border-b border-border pb-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                Уведомления
              </h2>
              <Button
                type="button"
                variant={status === "resolved" ? "secondary" : "outline"}
                size="sm"
                aria-pressed={status === "resolved"}
                onClick={() =>
                  setStatus((current) =>
                    current === "open" ? "resolved" : "open",
                  )
                }
              >
                Устраненные
              </Button>
            </div>
            <SummaryLine
              summary={summary}
              loading={summaryLoading}
              error={summaryError}
              onRetry={() => void refetchSummary()}
            />
          </div>
          <div className="pt-3">
            <NotificationList
              tenantId={activeTenantId}
              status={status}
              enabled={open}
              onNavigate={() => handleOpenChange(false)}
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function SummaryLine({
  summary,
  loading,
  error,
  onRetry,
}: {
  summary: NotificationSummary | null;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  if (summary) {
    return (
      <p className="text-xs text-muted-foreground">
        {summary.open === 0
          ? "Открытых условий нет."
          : `Открыто ${summary.open}. Превышений ${summary.critical}, близко к лимиту ${summary.warning}.`}
      </p>
    );
  }

  if (loading) {
    return <p className="text-xs text-muted-foreground">Загрузка сводки…</p>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-destructive">Не удалось загрузить сводку</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  return null;
}
