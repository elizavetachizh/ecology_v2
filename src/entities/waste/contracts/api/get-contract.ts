import { apiJson } from "../../../../shared/api/api-client";
import type { Contract } from "../model/contracts.types";

export function getContract(
  id: string,
  signal?: AbortSignal,
): Promise<Contract> {
  return apiJson<Contract>(`/api/v1/operations/contracts/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
