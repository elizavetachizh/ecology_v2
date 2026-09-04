import { apiJson } from "../../../../shared/api/api-client";
import type {
  DashboardBurialPermit,
  GetDashboardBurialPermitsParams,
} from "../model/dashboards.types";

export function getDashboardBurialPermits(
  params: GetDashboardBurialPermitsParams,
  signal?: AbortSignal,
): Promise<DashboardBurialPermit[]> {
  const searchParams = new URLSearchParams({ year: String(params.year) });
  return apiJson<DashboardBurialPermit[]>(
    `/api/v1/dashboards/burial-permits?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
