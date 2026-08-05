import { apiJson } from "../../../shared/api/api-client";
import type { CurrentUser } from "../model/user.types";

export function getCurrentUser(signal?: AbortSignal): Promise<CurrentUser> {
  return apiJson<CurrentUser>("/api/v1/me", { signal });
}
