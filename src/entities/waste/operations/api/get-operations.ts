import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetOperationsParams,
  OperationListResponse,
} from "../model/operations.types";

export function getOperations(
  params: GetOperationsParams,
  signal?: AbortSignal,
): Promise<OperationListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.unit_id) searchParams.set("unit_id", params.unit_id);
  if (params.waste_id) searchParams.set("waste_id", params.waste_id);
  if (params.operation_type)
    searchParams.set("operation_type", params.operation_type);
  if (params.date_from) searchParams.set("date_from", params.date_from);
  if (params.date_to) searchParams.set("date_to", params.date_to);
  return apiJson<OperationListResponse>(
    `/api/v1/operations/operations?${searchParams}`,
    {
      signal,
      tenantScoped: true,
    },
  );
}
