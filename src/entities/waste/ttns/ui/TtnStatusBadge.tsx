import { Badge } from "../../../../shared/ui";
import {
  TTN_STATUS_BADGE_VARIANT,
  TTN_STATUS_LABEL,
  type TtnStatus,
} from "../model/ttns.types";

type TtnStatusBadgeProps = {
  status: TtnStatus;
  className?: string;
};

export function TtnStatusBadge({ status, className }: TtnStatusBadgeProps) {
  return (
    <Badge variant={TTN_STATUS_BADGE_VARIANT[status]} className={className}>
      {TTN_STATUS_LABEL[status]}
    </Badge>
  );
}
