import { apiJson } from "../../../../shared/api/api-client";
import type { GetOrdersParams, OrderListResponse } from "../model/orders.types";
import { ordersCollectionPath } from "./paths";

export function getOrders(
  params: GetOrdersParams,
  signal?: AbortSignal,
): Promise<OrderListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.unit_id) searchParams.set("unit_id", params.unit_id);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<OrderListResponse>(
    `${ordersCollectionPath()}?${searchParams}`,
    {
      method: "GET",
      tenantScoped: true,
      signal,
    },
  );
}
