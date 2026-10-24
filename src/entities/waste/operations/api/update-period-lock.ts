import { apiSendJson } from "../../../../shared/api/api-client";
import type { PeriodLock, PeriodLockUpdate } from "../model/operations.types";

export function updatePeriodLock(
  body: PeriodLockUpdate,
  signal?: AbortSignal,
): Promise<PeriodLock> {
  return apiSendJson<PeriodLock>("/api/v1/operations/period-lock", {
    method: "PUT",
    body,
    tenantScoped: true,
    signal,
  });
}
