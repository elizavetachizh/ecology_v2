import { apiSendJson } from "../../../../shared/api/api-client";
import type { Contract, ContractCreate } from "../model/contracts.types";

export function createContract(
  body: ContractCreate,
  signal?: AbortSignal,
): Promise<Contract> {
  return apiSendJson<Contract>("/api/v1/operations/contracts", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
