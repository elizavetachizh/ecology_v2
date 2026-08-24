import { apiSendJson } from "../../../../shared/api/api-client";
import type {
  Counterparty,
  CounterpartyUpdate,
} from "../model/counterparties.types";

export function updateCounterparty(
  id: string,
  body: CounterpartyUpdate,
  signal?: AbortSignal,
): Promise<Counterparty> {
  return apiSendJson<Counterparty>(`/api/v1/mdm/counterparties/${id}`, {
    method: "PATCH",
    body,
    tenantScoped: true,
    signal,
  });
}
