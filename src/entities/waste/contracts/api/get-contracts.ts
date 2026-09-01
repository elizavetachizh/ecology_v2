import { apiJson } from "../../../../shared/api/api-client";
import type {
  ContractListResponse,
  GetContractsParams,
} from "../model/contracts.types";

export function getContracts(
  params: GetContractsParams,
  signal?: AbortSignal,
): Promise<ContractListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.counterparty_id)
    searchParams.set("counterparty_id", params.counterparty_id);
  if (params.contract_type)
    searchParams.set("contract_type", params.contract_type);
  if (params.waste_id) searchParams.set("waste_id", params.waste_id);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<ContractListResponse>(
    `/api/v1/operations/contracts?${searchParams}`,
    {
      method: "GET",
      tenantScoped: true,
      signal,
    },
  );
}
