import { apiJson } from "../../../../shared/api/api-client";
import type {
  DashboardBalanceStat,
  GetDashboardBalanceStatParams,
} from "../model/dashboards.types";

export function getDashboardBalanceStat(
  params: GetDashboardBalanceStatParams,
  signal?: AbortSignal,
): Promise<DashboardBalanceStat> {
  const searchParams = new URLSearchParams({
    on_date: params.on_date,
    unit_id: params.unit_id,
    waste_id: params.waste_id,
  });
  if (params.months != null) {
    searchParams.set("months", String(params.months));
  }
  return apiJson<DashboardBalanceStat>(
    `/api/v1/dashboards/balance/stat?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
