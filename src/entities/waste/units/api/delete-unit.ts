import { apiFetch } from "../../../../shared/api/api-client";

export async function deleteUnit(id: string): Promise<void> {
  await apiFetch(`/api/v1/mdm/units/${id}`, {
    method: "DELETE",
    tenantScoped: true,
  });
}
