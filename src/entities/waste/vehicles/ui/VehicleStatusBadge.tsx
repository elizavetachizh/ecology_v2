import { Badge } from "../../../../shared/ui";
import {
  VEHICLE_STATUS_BADGE_VARIANT,
  VEHICLE_STATUS_LABEL,
  type VehicleStatus,
} from "../model/vehicles.types";

type VehicleStatusBadgeProps = {
  status: VehicleStatus;
  className?: string;
};

export function VehicleStatusBadge({
  status,
  className,
}: VehicleStatusBadgeProps) {
  return (
    <Badge variant={VEHICLE_STATUS_BADGE_VARIANT[status]} className={className}>
      {VEHICLE_STATUS_LABEL[status]}
    </Badge>
  );
}
