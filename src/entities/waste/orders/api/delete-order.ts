import { apiDelete } from "../../../../shared/api/api-client";
import { orderItemPath } from "./paths";

export function deleteOrder(id: string): Promise<void> {
  return apiDelete(orderItemPath(id), { tenantScoped: true });
}
