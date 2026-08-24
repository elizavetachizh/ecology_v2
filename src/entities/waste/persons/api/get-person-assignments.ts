import { apiJson } from "../../../../shared/api/api-client";
import type { PersonAssignments } from "../../orders";
import type { GetPersonAssignmentsParams } from "../model/persons.types";

export function getPersonAssignments(
  params: GetPersonAssignmentsParams,
  signal?: AbortSignal,
): Promise<PersonAssignments> {
  const searchParams = new URLSearchParams();
  if (params.on) searchParams.set("on", params.on);
  const query = searchParams.toString();
  const path = `/api/v1/mdm/persons/${params.personId}/assignments`;
  return apiJson<PersonAssignments>(query ? `${path}?${query}` : path, {
    signal,
    tenantScoped: true,
  });
}
