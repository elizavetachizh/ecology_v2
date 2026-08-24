import type { UserProfile } from "../../../user";
import type { ContractBrief } from "../../contracts/model/contracts.types";
import type { UnitBrief } from "../../units/model/units.types";

export const TTN_STATUS_LABEL = {
  active: "Действует",
  inactive: "Не действует",
} as const;

export type TtnStatus = keyof typeof TTN_STATUS_LABEL;

export const TtnStatusValues = Object.keys(TTN_STATUS_LABEL) as [
  TtnStatus,
  ...TtnStatus[],
];

export const TTN_STATUS_BADGE_VARIANT: Record<
  TtnStatus,
  "success" | "secondary"
> = {
  active: "success",
  inactive: "secondary",
};

/** TtnRead */
export type Ttn = {
  id: string;
  tenant_id: string;
  number: string;
  date: string;
  status: TtnStatus;
  unit_id: string;
  unit: UnitBrief;
  recycling_contract_id: string;
  recycling_contract: ContractBrief;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type TtnCreate = {
  number: string;
  date: string;
  unit_id: string;
  recycling_contract_id: string;
  status?: TtnStatus;
};

export type TtnUpdate = Partial<TtnCreate>;

export const TtnSortFields = [
  "number",
  "date",
  "status",
  "created_at",
  "id",
] as const;
export type TtnSortField = (typeof TtnSortFields)[number];
export type TtnSortOrder = "asc" | "desc";

export type GetTtnsParams = {
  search?: string;
  status?: TtnStatus;
  unit_id?: string;
  recycling_contract_id?: string;
  date_from?: string;
  date_to?: string;
  sort?: TtnSortField;
  order?: TtnSortOrder;
  limit: number;
  offset: number;
};

export type TtnListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Ttn[];
};

export const DEFAULT_TTNS_LIST_LIMIT = 50;
