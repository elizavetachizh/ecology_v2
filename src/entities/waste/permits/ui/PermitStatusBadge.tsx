import { Badge } from "../../../../shared/ui";
import {
  PERMIT_STATUS_BADGE_VARIANT,
  PERMIT_STATUS_LABEL,
  type PermitStatus,
} from "../model/permits.types";

type PermitStatusBadgeProps = {
  status: PermitStatus;
  className?: string;
};

export function PermitStatusBadge({
  status,
  className,
}: PermitStatusBadgeProps) {
  return (
    <Badge
      variant={PERMIT_STATUS_BADGE_VARIANT[status]}
      className={className}
    >
      {PERMIT_STATUS_LABEL[status]}
    </Badge>
  );
}
