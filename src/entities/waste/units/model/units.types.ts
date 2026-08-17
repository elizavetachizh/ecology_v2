import type { UserProfile } from "../../../user";
import type { DistrictClassifier } from "../../district-classifier";
import type { RegionClassifier } from "../../region-classifier";

export type Unit = {
  id: string;
  tenant_id: string;
  name: string;
  short_name: string | null;
  parent_id: string | null;
  is_pod9: boolean;
  region: RegionClassifier | null;
  district: DistrictClassifier | null;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type UnitBrief = Pick<Unit, "id" | "name" | "short_name">;

/** Hierarchical read: Unit + children (GET ?hierarchical=true). */
export type UnitTree = Unit & {
  children: UnitTree[];
};

export type UnitListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Unit[];
};

export type UnitCreate = {
  name: string;
  short_name?: string | null;
  parent_id?: string | null;
  region_id?: number | null;
  district_id?: number | null;
  is_pod9?: boolean;
};

export type UnitUpdate = {
  name?: string;
  short_name?: string | null;
  parent_id?: string | null;
  region_id?: number | null;
  district_id?: number | null;
  is_pod9?: boolean;
};

export const UnitSortFields = [
  "name",
  "short_name",
  "region_id",
  "district_id",
  "created_at",
  "id",
] as const;

export type UnitSortField = (typeof UnitSortFields)[number];
export type UnitSortOrder = "asc" | "desc";

export const DEFAULT_UNITS_LIST_LIMIT = 50;

/** Flat list (Page). */
export type GetUnitsParams = {
  search?: string;
  region_id?: number;
  district_id?: number;
  is_pod9?: boolean;
  limit: number;
  offset: number;
  sort?: UnitSortField;
  order?: UnitSortOrder;
};

/**
 * Hierarchical tree. Backend ignores limit/offset.
 * search/filters: ответ = matches ∪ ancestors (потомков нерелевантных узлов нет).
 * sort/order применяются внутри каждого уровня.
 */
export type GetUnitsTreeParams = {
  search?: string;
  region_id?: number;
  district_id?: number;
  is_pod9?: boolean;
  sort?: UnitSortField;
  order?: UnitSortOrder;
};
