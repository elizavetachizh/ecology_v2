import { apiSendJson } from "../../../../shared/api/api-client";
import type { Contract, ContractUpdate } from "../model/contracts.types";

export function updateContract(
  id: string,
  body: ContractUpdate,
  signal?: AbortSignal,
): Promise<Contract> {
  return apiSendJson<Contract>(`/api/v1/operations/contracts/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
