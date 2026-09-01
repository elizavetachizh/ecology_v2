import { apiJson } from "../../../../shared/api/api-client";
import type {
  DashboardBalance,
  GetDashboardBalanceParams,
} from "../model/dashboards.types";

export function getDashboardBalance(
  params: GetDashboardBalanceParams,
  signal?: AbortSignal,
): Promise<DashboardBalance[]> {
  const searchParams = new URLSearchParams({ on_date: params.on_date });
  return apiJson<DashboardBalance[]>(
    `/api/v1/dashboards/balance?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
