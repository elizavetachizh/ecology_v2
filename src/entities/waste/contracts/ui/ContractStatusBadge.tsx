import { Badge } from "../../../../shared/ui";
import {
  CONTRACT_STATUS_BADGE_VARIANT,
  CONTRACT_STATUS_LABEL,
  type ContractStatus,
} from "../model/contracts.types";

type ContractStatusBadgeProps = {
  status: ContractStatus;
  className?: string;
};

export function ContractStatusBadge({
  status,
  className,
}: ContractStatusBadgeProps) {
  return (
    <Badge
      variant={CONTRACT_STATUS_BADGE_VARIANT[status]}
      className={className}
    >
      {CONTRACT_STATUS_LABEL[status]}
    </Badge>
  );
}
