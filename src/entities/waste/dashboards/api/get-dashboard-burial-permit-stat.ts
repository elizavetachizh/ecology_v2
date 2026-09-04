import { apiJson } from "../../../../shared/api/api-client";
import type {
  DashboardBurialPermitStat,
  GetDashboardBurialPermitStatParams,
} from "../model/dashboards.types";

export function getDashboardBurialPermitStat(
  params: GetDashboardBurialPermitStatParams,
  signal?: AbortSignal,
): Promise<DashboardBurialPermitStat> {
  const searchParams = new URLSearchParams({
    year: String(params.year),
    permit_id: params.permit_id,
    waste_id: params.waste_id,
  });
  return apiJson<DashboardBurialPermitStat>(
    `/api/v1/dashboards/burial-permits/stat?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
