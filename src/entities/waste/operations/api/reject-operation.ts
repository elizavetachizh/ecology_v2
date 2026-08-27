import { apiJson } from "../../../../shared/api/api-client";
import type { Operation } from "../model/operations.types";

export function rejectOperation(
  operationId: string,
  signal?: AbortSignal,
): Promise<Operation> {
  return apiJson<Operation>(
    `/api/v1/operations/operations/${operationId}/reject`,
    {
      method: "POST",
      tenantScoped: true,
      signal,
    },
  );
}
