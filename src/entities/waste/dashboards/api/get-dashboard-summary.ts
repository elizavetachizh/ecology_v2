import { apiJson } from "../../../../shared/api/api-client";
import type {
  DashboardSummary,
  GetDashboardSummaryParams,
} from "../model/dashboards.types";

export function getDashboardSummary(
  params: GetDashboardSummaryParams,
  signal?: AbortSignal,
): Promise<DashboardSummary> {
  const searchParams = new URLSearchParams({
    date_from: params.date_from,
    date_to: params.date_to,
  });
  return apiJson<DashboardSummary>(
    `/api/v1/dashboards/summary?${searchParams}`,
    { signal, tenantScoped: true },
  );
}
