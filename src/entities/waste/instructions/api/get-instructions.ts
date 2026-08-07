import { apiJson } from "../../../../shared/api/api-client";
import type {
  InstructionListResponse,
  InstructionStatus,
} from "../model/instructions.types";
export interface GetInstructionsParams {
  search?: string;
  status?: InstructionStatus;
  sort?: string;
  order?: string;
  limit: number;
  offset: number;
}
export function getInstructions(
  params: GetInstructionsParams,
  signal?: AbortSignal,
): Promise<InstructionListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<InstructionListResponse>(
    `/api/v1/mdm/instructions?${searchParams}`,
    {
      signal,
      tenantScoped: true,
    },
  );
}
