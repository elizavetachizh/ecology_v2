import { apiJson } from "../../../../shared/api/api-client";
import type {
  DashboardFormed,
  GetDashboardFormedParams,
} from "../model/dashboards.types";

export function getDashboardFormed(
  params: GetDashboardFormedParams,
  signal?: AbortSignal,
): Promise<DashboardFormed[]> {
  const searchParams = new URLSearchParams({ year: String(params.year) });
  return apiJson<DashboardFormed[]>(
    `/api/v1/dashboards/formed?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
