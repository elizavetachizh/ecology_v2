import { apiJson } from "../../../../shared/api/api-client";
import type {
  CounterpartyListResponse,
  GetCounterpartiesParams,
} from "../model/counterparties.types";

export function getCounterparties(
  params: GetCounterpartiesParams,
  signal?: AbortSignal,
): Promise<CounterpartyListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);
  if (params.is_individual != null) {
    searchParams.set("is_individual", String(params.is_individual));
  }
  if (params.is_active != null) {
    searchParams.set("is_active", String(params.is_active));
  }
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<CounterpartyListResponse>(
    `/api/v1/mdm/counterparties?${searchParams}`,
    { method: "GET", signal, tenantScoped: true },
  );
}
