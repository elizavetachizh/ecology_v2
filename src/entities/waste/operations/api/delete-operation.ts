import { apiDelete } from "../../../../shared/api/api-client";

export function deleteOperation(operationId: string): Promise<void> {
  return apiDelete(`/api/v1/operations/${operationId}`, { tenantScoped: true });
}
