import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetOperationsParams,
  Operation,
  OperationListResponse,
} from "../model/operations.types";

export function getOperations(
  params: GetOperationsParams,
  signal?: AbortSignal,
): Promise<Operation[]> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
    unit_id: params.unit_id,
    waste_id: params.waste_id,
    date_from: params.date_from,
    date_to: params.date_to,
  });
  return apiJson<OperationListResponse>(`/operations?${searchParams}`, {
    method: "GET",
    signal,
    tenantScoped: true,
  });
}
