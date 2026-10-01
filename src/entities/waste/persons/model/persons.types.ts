import type { UserProfile } from "../../../user";
import type { UnitBrief } from "../../units";

/** PersonRead — ответ backend */
export type Person = {
  id: string;
  tenant_id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  beltopgas_uuid: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  user: UserProfile | null;
  units: UnitBrief[];
  unit_ids: string[];
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** Nested в ответах — без audit / user_id. */
export type PersonBrief = Pick<
  Person,
  "id" | "name" | "first_name" | "last_name" | "middle_name"
>;

export type PersonCreate = {
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  beltopgas_uuid?: string | null;
  unit_ids?: string[];
};

export type PersonUpdate = Partial<PersonCreate>;

export type PersonListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Person[];
};

export const PersonSortFields = [
  "name",
  "last_name",
  "first_name",
  "created_at",
  "id",
] as const;
export type PersonSortField = (typeof PersonSortFields)[number];
export type PersonSortOrder = "asc" | "desc";

export type GetPersonsParams = {
  search?: string;
  sort?: PersonSortField;
  order?: PersonSortOrder;
  limit: number;
  offset: number;
};

export const DEFAULT_PERSONS_LIST_LIMIT = 50;
export const DEFAULT_PERSONS_OPTIONS_LIMIT = 20;
