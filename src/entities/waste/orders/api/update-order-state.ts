import { apiSendJson } from "../../../../shared/api/api-client";
import type { OrderState, OrderStateUpdate } from "../model/orders.types";
import { orderStateItemPath } from "./paths";

export function updateOrderState(
  orderId: string,
  stateId: string,
  body: OrderStateUpdate,
  signal?: AbortSignal,
): Promise<OrderState> {
  return apiSendJson<OrderState>(orderStateItemPath(orderId, stateId), {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
