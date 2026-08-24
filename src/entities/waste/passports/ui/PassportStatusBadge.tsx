import { Badge } from "../../../../shared/ui";
import {
  PASSPORT_STATUS_BADGE_VARIANT,
  PASSPORT_STATUS_LABEL,
  type PassportStatus,
} from "../model/passports.types";

type PassportStatusBadgeProps = {
  status: PassportStatus;
  className?: string;
};

export function PassportStatusBadge({
  status,
  className,
}: PassportStatusBadgeProps) {
  return (
    <Badge
      variant={PASSPORT_STATUS_BADGE_VARIANT[status]}
      className={className}
    >
      {PASSPORT_STATUS_LABEL[status]}
    </Badge>
  );
}
