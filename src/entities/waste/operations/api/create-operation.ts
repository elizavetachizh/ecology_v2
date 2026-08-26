import { apiSendJson } from "../../../../shared/api/api-client";
import type { Operation, OperationCreate } from "../model/operations.types";

export function createOperation(
  body: OperationCreate,
  signal?: AbortSignal,
): Promise<Operation> {
  return apiSendJson<Operation>("/api/v1/operations/operations", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
