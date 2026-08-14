import { apiJson } from "../../../../shared/api/api-client";
import type { Operation, OperationCreate } from "../model/operations.types";

export function createOperation(
  body: OperationCreate,
  signal?: AbortSignal,
): Promise<Operation> {
  return apiJson<Operation>(`/operations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    tenantScoped: true,
    body: JSON.stringify(body),
    signal,
  });
}
