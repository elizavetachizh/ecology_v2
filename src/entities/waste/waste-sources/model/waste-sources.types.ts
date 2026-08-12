import type { UserProfile } from "../../../user";

/** WasteSourceRead — ответ backend */
export type WasteSource = {
  id: string;
  tenant_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type WasteSourceCreate = {
  name: string;
};

export type WasteSourceUpdate = {
  name?: string;
};

export type WasteSourceListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: WasteSource[];
};

export const WasteSourceSortFields = ["name", "created_at", "id"] as const;
export type WasteSourceSortField = (typeof WasteSourceSortFields)[number];
export type WasteSourceSortOrder = "asc" | "desc";

export type GetWasteSourcesParams = {
  search?: string;
  limit: number;
  offset: number;
  order?: WasteSourceSortOrder;
  sort?: WasteSourceSortField;
};

export const DEFAULT_WASTE_SOURCES_LIST_LIMIT = 50;
export const DEFAULT_WASTE_SOURCES_OPTIONS_LIMIT = 20;
