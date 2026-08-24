import { apiDelete } from "../../../../shared/api/api-client";
import { orderStateItemPath } from "./paths";

export function deleteOrderState(
  orderId: string,
  stateId: string,
): Promise<void> {
  return apiDelete(orderStateItemPath(orderId, stateId), {
    tenantScoped: true,
  });
}
