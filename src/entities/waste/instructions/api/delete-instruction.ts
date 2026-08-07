import { apiFetch } from "../../../../shared/api/api-client";

export async function deleteInstruction(id: string): Promise<void> {
  await apiFetch(`/api/v1/mdm/instructions/${id}`, {
    method: "DELETE",
    tenantScoped: true,
  });
}
