import { apiDelete } from "../../../../shared/api/api-client";

export function deleteCounterparty(id: string): Promise<void> {
  return apiDelete(`/api/v1/mdm/counterparties/${id}`, { tenantScoped: true });
}
