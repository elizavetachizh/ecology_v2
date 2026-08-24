import { apiJson } from "../../../../shared/api/api-client";
import type {
  GetPersonsParams,
  PersonListResponse,
} from "../model/persons.types";

export function getPersons(
  params: GetPersonsParams,
  signal?: AbortSignal,
): Promise<PersonListResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.search) searchParams.set("search", params.search);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  return apiJson<PersonListResponse>(`/api/v1/mdm/persons?${searchParams}`, {
    signal,
    tenantScoped: true,
  });
}
