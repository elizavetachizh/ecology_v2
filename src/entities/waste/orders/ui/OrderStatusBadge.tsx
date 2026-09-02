import { Badge } from "../../../../shared/ui";
import {
  ORDER_STATUS_BADGE_VARIANT,
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "../model/orders.types";

type OrderStatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge variant={ORDER_STATUS_BADGE_VARIANT[status]} className={className}>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}
