import { apiSendJson } from "../../../../shared/api/api-client";
import type { Order, OrderUpdate } from "../model/orders.types";
import { orderItemPath } from "./paths";

export function updateOrder(
  id: string,
  body: OrderUpdate,
  signal?: AbortSignal,
): Promise<Order> {
  return apiSendJson<Order>(orderItemPath(id), {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
