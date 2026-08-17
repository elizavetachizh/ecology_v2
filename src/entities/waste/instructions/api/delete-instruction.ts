import { apiDelete } from "../../../../shared/api/api-client";

export function deleteInstruction(id: string): Promise<void> {
  return apiDelete(`/api/v1/mdm/instructions/${id}`, { tenantScoped: true });
}
