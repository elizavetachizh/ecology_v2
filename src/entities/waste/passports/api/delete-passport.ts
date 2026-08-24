import { apiDelete } from "../../../../shared/api/api-client";

export function deletePassport(id: string): Promise<void> {
  return apiDelete(`/api/v1/operations/passports/${id}`, {
    tenantScoped: true,
  });
}
