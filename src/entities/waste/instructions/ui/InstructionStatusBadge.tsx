import { Badge } from "../../../../shared/ui";
import {
  INSTRUCTION_STATUS_BADGE_VARIANT,
  INSTRUCTION_STATUS_LABEL,
  type InstructionStatus,
} from "../model/instructions.types";

type InstructionStatusBadgeProps = {
  status: InstructionStatus;
  className?: string;
};

export function InstructionStatusBadge({
  status,
  className,
}: InstructionStatusBadgeProps) {
  return (
    <Badge
      variant={INSTRUCTION_STATUS_BADGE_VARIANT[status]}
      className={className}
    >
      {INSTRUCTION_STATUS_LABEL[status]}
    </Badge>
  );
}
