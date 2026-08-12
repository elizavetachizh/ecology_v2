import { apiFetch } from "../../../../shared/api/api-client";

export async function deleteWaste(id: string): Promise<void> {
  await apiFetch(`/api/v1/mdm/wastes/${id}`, {
    method: "DELETE",
    tenantScoped: true,
  });
}
