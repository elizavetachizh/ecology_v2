import { apiFetch } from "../../../../shared/api/api-client";

export async function deleteWasteSource(id: string): Promise<void> {
  await apiFetch(`/api/v1/mdm/waste-sources/${id}`, {
    method: "DELETE",
    tenantScoped: true,
  });
}
