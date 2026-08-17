import { apiJson } from "../../../../shared/api/api-client";
import type {
  BalanceListResponse,
  GetBalancesParams,
} from "../model/operations.types";

export function getBalances(
  params: GetBalancesParams,
  signal?: AbortSignal,
): Promise<BalanceListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.unit_id) searchParams.set("unit_id", params.unit_id);
  if (params.waste_id) searchParams.set("waste_id", params.waste_id);
  if (params.date_from) searchParams.set("date_from", params.date_from);
  if (params.date_to) searchParams.set("date_to", params.date_to);
  return apiJson<BalanceListResponse>(
    `/api/v1/operations/balances?${searchParams}`,
    {
      signal,
      tenantScoped: true,
    },
  );
}
