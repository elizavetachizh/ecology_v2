import { Badge } from "../../../../shared/ui";
import {
  STANDARD_STATUS_BADGE_VARIANT,
  STANDARD_STATUS_LABEL,
  type StandardStatus,
} from "../model/standards.types";

type StandardStatusBadgeProps = {
  status: StandardStatus;
  className?: string;
};

export function StandardStatusBadge({
  status,
  className,
}: StandardStatusBadgeProps) {
  return (
    <Badge
      variant={STANDARD_STATUS_BADGE_VARIANT[status]}
      className={className}
    >
      {STANDARD_STATUS_LABEL[status]}
    </Badge>
  );
}
