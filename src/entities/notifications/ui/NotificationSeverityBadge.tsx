import { Badge } from "../../../shared/ui";
import {
  NOTIFICATION_SEVERITY_BADGE_VARIANT,
  NOTIFICATION_SEVERITY_LABEL,
  type NotificationSeverity,
} from "../model/notifications.types";

type NotificationSeverityBadgeProps = {
  severity: NotificationSeverity;
  className?: string;
};

export function NotificationSeverityBadge({
  severity,
  className,
}: NotificationSeverityBadgeProps) {
  return (
    <Badge
      variant={NOTIFICATION_SEVERITY_BADGE_VARIANT[severity]}
      className={className}
    >
      {NOTIFICATION_SEVERITY_LABEL[severity]}
    </Badge>
  );
}
