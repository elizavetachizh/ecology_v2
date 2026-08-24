import { apiJson } from "../../../../shared/api/api-client";
import type { Order } from "../model/orders.types";
import { orderItemPath } from "./paths";

export function getOrder(id: string, signal?: AbortSignal): Promise<Order> {
  return apiJson<Order>(orderItemPath(id), {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
