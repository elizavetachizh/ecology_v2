import { apiDelete } from "../../../../shared/api/api-client";

export function deleteTtn(id: string): Promise<void> {
  return apiDelete(`/api/v1/operations/ttns/${id}`, {
    tenantScoped: true,
  });
}
