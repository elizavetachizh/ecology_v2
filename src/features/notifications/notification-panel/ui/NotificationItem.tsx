import { Link } from "@tanstack/react-router";
import {
  isTransportUnitThresholdNotification,
  NotificationSeverityBadge,
  type Notification,
  type NotificationSeverity,
} from "../../../../entities/notifications";
import { cn } from "../../../../shared/lib/cn";
import { formatDateTime } from "../../../../shared/lib/format-date";
import {
  formatThresholdFill,
  type ThresholdFill,
} from "../model/format-threshold-ratio";
import {
  notificationLinks,
  type NotificationPanelLink,
} from "../model/notification-links";

type NotificationItemProps = {
  notification: Notification;
  onNavigate?: () => void;
};

const STRIPE_CLASS: Record<NotificationSeverity, string> = {
  critical: "border-l-destructive",
  warning: "border-l-warning",
  info: "border-l-info",
};

const BAR_CLASS: Record<NotificationSeverity, string> = {
  critical: "bg-destructive",
  warning: "bg-warning",
  info: "bg-info",
};

const PERCENT_CLASS: Record<NotificationSeverity, string> = {
  critical: "text-destructive",
  warning: "text-warning-foreground",
  info: "text-info",
};

export function NotificationItem({
  notification,
  onNavigate,
}: NotificationItemProps) {
  const fill = isTransportUnitThresholdNotification(notification)
    ? formatThresholdFill(notification.payload)
    : null;
  const links = notificationLinks(notification);

  return (
    <article
      className={cn(
        "grid gap-2 rounded-md border border-l-4 border-border bg-card p-3",
        STRIPE_CLASS[notification.severity],
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <NotificationSeverityBadge severity={notification.severity} />
        <time
          dateTime={notification.detected_at}
          className="shrink-0 text-xs text-muted-foreground"
        >
          {formatDateTime(notification.detected_at)}
        </time>
      </div>
      <h3 className="text-sm font-medium leading-snug text-foreground">
        {notification.title}
      </h3>
      {notification.body ? (
        <p className="text-sm text-muted-foreground">{notification.body}</p>
      ) : null}
      {fill ? (
        <ThresholdBar fill={fill} severity={notification.severity} />
      ) : null}
      {links.length > 0 ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {links.map((link) => (
            <NotificationAnchor
              key={link.kind}
              link={link}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function ThresholdBar({
  fill,
  severity,
}: {
  fill: ThresholdFill;
  severity: NotificationSeverity;
}) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          {fill.amountLabel} из {fill.transportUnitLabel}
        </span>
        <span className={cn("font-medium", PERCENT_CLASS[severity])}>
          {fill.percentLabel}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={fill.barPercent}
        aria-label={`Заполненность ${fill.percentLabel}`}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full", BAR_CLASS[severity])}
          style={{ width: `${fill.barPercent}%` }}
        />
      </div>
    </div>
  );
}

function NotificationAnchor({
  link,
  onNavigate,
}: {
  link: NotificationPanelLink;
  onNavigate?: () => void;
}) {
  const className =
    "text-xs font-medium text-primary underline-offset-4 hover:underline";

  if (link.kind === "operations") {
    return (
      <Link
        to={link.to}
        search={link.search}
        className={className}
        onClick={onNavigate}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <Link
      to={link.to}
      params={link.params}
      search={link.search}
      className={className}
      onClick={onNavigate}
    >
      {link.label}
    </Link>
  );
}
