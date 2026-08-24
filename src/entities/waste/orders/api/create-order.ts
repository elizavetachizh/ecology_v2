import { apiSendJson } from "../../../../shared/api/api-client";
import type { Order, OrderCreate } from "../model/orders.types";
import { ordersCollectionPath } from "./paths";

export function createOrder(
  body: OrderCreate,
  signal?: AbortSignal,
): Promise<Order> {
  return apiSendJson<Order>(ordersCollectionPath(), {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
