import { apiSendJson } from "../../../../shared/api/api-client";
import type {
  Counterparty,
  CounterpartyCreate,
} from "../model/counterparties.types";

export function createCounterparty(
  body: CounterpartyCreate,
  signal?: AbortSignal,
): Promise<Counterparty> {
  return apiSendJson<Counterparty>("/api/v1/mdm/counterparties", {
    method: "POST",
    body,
    tenantScoped: true,
    signal,
  });
}
