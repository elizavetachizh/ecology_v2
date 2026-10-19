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

/** PermitBurialWasteRead и PermitStorageWasteRead — одинаковый набор полей. */
export type PermitLimitWaste = {
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

export type PermitBurialWaste = PermitLimitWaste;
export type PermitStorageWaste = PermitLimitWaste;

/** PermitRead */
export type Permit = {
  id: string;
  tenant_id: string;
  number: string;
  start_date: string;
  end_date: string | null;
  status: PermitStatus;
  unit_id: string | null;
  unit: UnitBrief | null;
  burial_wastes: PermitBurialWaste[];
  storage_wastes: PermitStorageWaste[];
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type PermitLimitWasteWrite = {
  waste_id: string;
  amount: string;
};

export type PermitBurialWasteWrite = PermitLimitWasteWrite;
export type PermitStorageWasteWrite = PermitLimitWasteWrite;

export type PermitCreate = {
  number: string;
  start_date: string;
  end_date?: string | null;
  status?: PermitStatus;
  unit_id?: string | null;
  burial_wastes?: PermitBurialWasteWrite[];
  storage_wastes?: PermitStorageWasteWrite[];
};

/**
 * PATCH каждой коллекции: omit = не трогать; [] / [...] = полная замена.
 * burial_wastes и storage_wastes заменяются независимо.
 */
export type PermitUpdate = {
  number?: string;
  start_date?: string;
  end_date?: string | null;
  status?: PermitStatus;
  unit_id?: string | null;
  burial_wastes?: PermitBurialWasteWrite[];
  storage_wastes?: PermitStorageWasteWrite[];
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
