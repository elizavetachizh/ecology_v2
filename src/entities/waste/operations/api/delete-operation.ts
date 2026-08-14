import { apiFetch } from "../../../../shared/api/api-client";

export async function deleteOperation(operationId: string): Promise<void> {
  await apiFetch(`/operations/${operationId}`, {
    method: "DELETE",
    tenantScoped: true,
  });
}
