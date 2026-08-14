import { apiJson } from "../../../../shared/api/api-client";
import type { Operation, OperationUpdate } from "../model/operations.types";

export function updateOperation(
  operationId: string,
  body: OperationUpdate,
  signal?: AbortSignal,
): Promise<Operation> {
  return apiJson<Operation>(`/operations/${operationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    tenantScoped: true,
    body: JSON.stringify(body),
    signal,
  });
}
