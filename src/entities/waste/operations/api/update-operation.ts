import { apiSendJson } from "../../../../shared/api/api-client";
import type { Operation, OperationUpdate } from "../model/operations.types";

export function updateOperation(
  operationId: string,
  body: OperationUpdate,
  signal?: AbortSignal,
): Promise<Operation> {
  return apiSendJson<Operation>(`/api/v1/operations/${operationId}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
