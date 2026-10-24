import { apiJson } from "../../../../shared/api/api-client";
import type { PeriodLock } from "../model/operations.types";

export function getPeriodLock(signal?: AbortSignal): Promise<PeriodLock> {
  return apiJson<PeriodLock>("/api/v1/operations/period-lock", {
    signal,
    tenantScoped: true,
  });
}
