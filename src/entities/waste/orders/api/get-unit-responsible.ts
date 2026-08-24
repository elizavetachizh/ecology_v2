import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetUnitResponsibleParams,
  UnitResponsible,
} from "../model/orders.types";
import { unitResponsiblePath } from "./paths";

export function getUnitResponsible(
  params: GetUnitResponsibleParams,
  signal?: AbortSignal,
): Promise<UnitResponsible> {
  const searchParams = new URLSearchParams();
  if (params.on) searchParams.set("on", params.on);
  const query = searchParams.toString();
  const path = unitResponsiblePath(params.unitId);
  return apiJson<UnitResponsible>(query ? `${path}?${query}` : path, {
    signal,
    tenantScoped: true,
  });
}
