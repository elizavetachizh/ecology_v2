import type { UserProfile } from "../../../user";
import type { UnitBrief } from "../../units";
import type { WasteBrief } from "../../wastes";

export function standardUnitLabel(
  unit: Pick<UnitBrief, "name" | "short_name">,
): string {
  return unit.short_name ?? unit.name;
}

export const STANDARD_STATUS_LABEL = {
  active: "Действует",
  inactive: "Не действует",
} as const;

export const STANDARD_ALL_STATUS_LABEL = {
  all: "Все",
  active: "Действующие",
  inactive: "Недействующие",
} as const;

export type StandardStatus = keyof typeof STANDARD_STATUS_LABEL;
export type StandardAllStatus = keyof typeof STANDARD_ALL_STATUS_LABEL;

export const StandardStatusValues = Object.keys(STANDARD_STATUS_LABEL) as [
  StandardStatus,
  ...StandardStatus[],
];

export const StandardAllStatusValues = Object.keys(
  STANDARD_ALL_STATUS_LABEL,
) as [StandardAllStatus, ...StandardAllStatus[]];

export const STANDARD_STATUS_BADGE_VARIANT: Record<
  StandardStatus,
  "success" | "secondary"
> = {
  active: "success",
  inactive: "secondary",
};

/** StandardUnitWasteRead */
export type StandardUnitWaste = {
  id: string;
  tenant_id: string;
  standard_unit_id: string;
  waste_id: string;
  waste: WasteBrief;
  amount: string;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** StandardUnitRead */
export type StandardUnit = {
  id: string;
  tenant_id: string;
  standard_id: string;
  unit_id: string;
  unit: UnitBrief;
  wastes: StandardUnitWaste[];
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** StandardRead */
export type Standard = {
  id: string;
  tenant_id: string;
  start_date: string;
  status: StandardStatus;
  units: StandardUnit[];
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type StandardUnitWasteWrite = {
  waste_id: string;
  amount: string;
};

export type StandardUnitWrite = {
  unit_id: string;
  wastes?: StandardUnitWasteWrite[];
};

export type StandardCreate = {
  start_date: string;
  units?: StandardUnitWrite[];
};

/** PATCH units: omit = не трогать; [] / [...] = replace-all дерева. */
export type StandardUpdate = {
  start_date?: string;
  units?: StandardUnitWrite[];
};

export const StandardSortFields = [
  "start_date",
  "status",
  "created_at",
  "id",
] as const;
export type StandardSortField = (typeof StandardSortFields)[number];
export type StandardSortOrder = "asc" | "desc";

export type GetStandardsParams = {
  status?: StandardStatus;
  unit_id?: string;
  sort?: StandardSortField;
  order?: StandardSortOrder;
  limit: number;
  offset: number;
};

export type StandardListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Standard[];
};

export const DEFAULT_STANDARDS_LIST_LIMIT = 50;
