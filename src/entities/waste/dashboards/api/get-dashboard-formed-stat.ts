import { apiJson } from "../../../../shared/api/api-client";
import type {
  DashboardFormedStat,
  GetDashboardFormedStatParams,
} from "../model/dashboards.types";

export function getDashboardFormedStat(
  params: GetDashboardFormedStatParams,
  signal?: AbortSignal,
): Promise<DashboardFormedStat> {
  const searchParams = new URLSearchParams({
    year: String(params.year),
    waste_id: params.waste_id,
  });
  return apiJson<DashboardFormedStat>(
    `/api/v1/dashboards/formed/stat?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
