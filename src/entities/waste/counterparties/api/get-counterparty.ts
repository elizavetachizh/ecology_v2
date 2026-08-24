import { apiJson } from "../../../../shared/api/api-client";
import type { Counterparty } from "../model/counterparties.types";

export function getCounterparty(
  id: string,
  signal?: AbortSignal,
): Promise<Counterparty> {
  return apiJson<Counterparty>(`/api/v1/mdm/counterparties/${id}`, {
    method: "GET",
    tenantScoped: true,
    signal,
  });
}
