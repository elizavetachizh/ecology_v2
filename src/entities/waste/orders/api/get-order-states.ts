import { apiJson } from "../../../../shared/api/api-client";
import type { OrderState } from "../model/orders.types";
import { orderStatesPath } from "./paths";

export function getOrderStates(
  orderId: string,
  signal?: AbortSignal,
): Promise<OrderState[]> {
  return apiJson<OrderState[]>(orderStatesPath(orderId), {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
