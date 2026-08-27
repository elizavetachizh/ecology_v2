import type { UserProfile } from "../../../user";
import type { UnitBrief } from "../../units";
import type { WasteBrief } from "../../wastes";

export const PERMIT_STATUS_LABEL = {
  active: "Действует",
  inactive: "Не действует",
} as const;

export const PERMIT_ALL_STATUS_LABEL = {
  all: "Все",
  active: "Действующие",
  inactive: "Недействующие",
} as const;

export type PermitStatus = keyof typeof PERMIT_STATUS_LABEL;
export type PermitAllStatus = keyof typeof PERMIT_ALL_STATUS_LABEL;

export const PermitStatusValues = Object.keys(PERMIT_STATUS_LABEL) as [
  PermitStatus,
  ...PermitStatus[],
];

export const PermitAllStatusValues = Object.keys(PERMIT_ALL_STATUS_LABEL) as [
  PermitAllStatus,
  ...PermitAllStatus[],
];

export const PERMIT_STATUS_BADGE_VARIANT: Record<
  PermitStatus,
  "success" | "secondary"
> = {
  active: "success",
  inactive: "secondary",
};

/** PermitBurialWasteRead */
export type PermitBurialWaste = {
  id: string;
  tenant_id: string;
  permit_id: string;
  waste_id: string;
  waste: WasteBrief;
  amount: string;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** PermitRead */
export type Permit = {
  id: string;
  tenant_id: string;
  number: string;
  start_date: string;
  end_date: string | null;
  status: PermitStatus;
  unit_id: string;
  unit: UnitBrief;
  burial_wastes: PermitBurialWaste[];
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type PermitBurialWasteWrite = {
  waste_id: string;
  amount: string;
};

export type PermitCreate = {
  number: string;
  start_date: string;
  end_date?: string | null;
  status?: PermitStatus;
  unit_id: string;
  burial_wastes?: PermitBurialWasteWrite[];
};

/** PATCH burial_wastes: omit = не трогать; [] = очистить перечень. */
export type PermitUpdate = {
  number?: string;
  start_date?: string;
  end_date?: string | null;
  status?: PermitStatus;
  unit_id?: string;
  burial_wastes?: PermitBurialWasteWrite[];
};

export const PermitSortFields = [
  "number",
  "start_date",
  "end_date",
  "status",
  "created_at",
  "id",
] as const;
export type PermitSortField = (typeof PermitSortFields)[number];
export type PermitSortOrder = "asc" | "desc";

export type GetPermitsParams = {
  search?: string;
  status?: PermitStatus;
  unit_id?: string;
  sort?: PermitSortField;
  order?: PermitSortOrder;
  limit: number;
  offset: number;
};

export type PermitListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Permit[];
};

export const DEFAULT_PERMITS_LIST_LIMIT = 50;
export const DEFAULT_PERMITS_OPTIONS_LIMIT = 20;
