import { apiJson } from "../../../../shared/api/api-client";
import type { Operation } from "../model/operations.types";

export function getOperation(
  operationId: string,
  signal?: AbortSignal,
): Promise<Operation> {
  return apiJson<Operation>(`/api/v1/operations/${operationId}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
