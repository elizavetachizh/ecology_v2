import { apiSendJson } from "../../../../shared/api/api-client";
import type { OrderState, OrderStateWrite } from "../model/orders.types";
import { orderStatesPath } from "./paths";

export function createOrderState(
  orderId: string,
  body: OrderStateWrite,
  signal?: AbortSignal,
): Promise<OrderState> {
  return apiSendJson<OrderState>(orderStatesPath(orderId), {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
