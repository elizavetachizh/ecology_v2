import { Badge } from "../../../../shared/ui";
import {
  OPERATION_STATUS_BADGE_VARIANT,
  OPERATION_STATUS_LABEL,
  type OperationStatus,
} from "../model/operations.types";

type OperationStatusBadgeProps = {
  status: OperationStatus;
  className?: string;
};

export function OperationStatusBadge({
  status,
  className,
}: OperationStatusBadgeProps) {
  return (
    <Badge
      variant={OPERATION_STATUS_BADGE_VARIANT[status]}
      className={className}
    >
      {OPERATION_STATUS_LABEL[status]}
    </Badge>
  );
}
