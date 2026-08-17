import { apiJson } from "../../../../shared/api/api-client";
import type {
  BalanceCurrent,
  GetCurrentBalanceParams,
} from "../model/operations.types";

export function getCurrentBalance(
  params: GetCurrentBalanceParams,
  signal?: AbortSignal,
): Promise<BalanceCurrent> {
  const searchParams = new URLSearchParams({
    unit_id: params.unit_id,
    waste_id: params.waste_id,
  });
  return apiJson<BalanceCurrent>(
    `/api/v1/operations/balances/current?${searchParams}`,
    {
      signal,
      tenantScoped: true,
    },
  );
}
