import { apiDelete } from "../../../../shared/api/api-client";

export function deleteContract(id: string): Promise<void> {
  return apiDelete(`/api/v1/operations/contracts/${id}`, {
    tenantScoped: true,
  });
}
