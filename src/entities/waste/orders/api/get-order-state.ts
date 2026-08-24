import { apiJson } from "../../../../shared/api/api-client";
import type { OrderState } from "../model/orders.types";
import { orderStateItemPath } from "./paths";

export function getOrderState(
  orderId: string,
  stateId: string,
  signal?: AbortSignal,
): Promise<OrderState> {
  return apiJson<OrderState>(orderStateItemPath(orderId, stateId), {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
