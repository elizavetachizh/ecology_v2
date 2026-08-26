import type { UserProfile } from "../../../user";
import type { WasteBrief } from "../../wastes";
import type { UnitBrief } from "../../units";
import type { ContractBrief } from "../../contracts";
import type { CounterpartyBrief } from "../../counterparties";

export const PASSPORT_TRANSPORT_TYPE_LABEL = {
  self: "Самостоятельно",
  transport_contract: "По договору перевозки",
  recycling_contract: "По договору утилизации",
} as const;

export type PassportTransportType = keyof typeof PASSPORT_TRANSPORT_TYPE_LABEL;

export const PassportTransportTypeValues = Object.keys(
  PASSPORT_TRANSPORT_TYPE_LABEL,
) as [PassportTransportType, ...PassportTransportType[]];

export const PASSPORT_STATUS_LABEL = {
  active: "Действует",
  inactive: "Не действует",
} as const;

export const PASSPORT_ALL_STATUS_LABEL = {
  all: "Все",
  active: "Действующие",
  inactive: "Закрытые",
} as const;

export type PassportStatus = keyof typeof PASSPORT_STATUS_LABEL;
export type PassportAllStatus = keyof typeof PASSPORT_ALL_STATUS_LABEL;

export const PassportStatusValues = Object.keys(PASSPORT_STATUS_LABEL) as [
  PassportStatus,
  ...PassportStatus[],
];

export const PassportAllStatusValues = Object.keys(
  PASSPORT_ALL_STATUS_LABEL,
) as [PassportAllStatus, ...PassportAllStatus[]];

export const PASSPORT_STATUS_BADGE_VARIANT: Record<
  PassportStatus,
  "success" | "secondary"
> = {
  active: "success",
  inactive: "secondary",
};

/** PassportWasteRead */
export type PassportWaste = {
  id: string;
  tenant_id: string;
  passport_id: string;
  waste_id: string;
  waste: WasteBrief;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** PassportRead */
export type Passport = {
  id: string;
  tenant_id: string;
  number: string;
  date: string;
  unit_id: string;
  unit: UnitBrief;
  recycling_contract_id: string;
  recycling_contract: ContractBrief;
  transport_type: PassportTransportType;
  transport_contract_id: string | null;
  transport_contract: ContractBrief | null;
  status: PassportStatus;
  waste_producer_id: string | null;
  waste_producer: CounterpartyBrief | null;
  wastes: PassportWaste[];
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type PassportBrief = Pick<Passport, "id" | "number" | "date" | "status">;

export type PassportWasteWrite = {
  waste_id: string;
};

export type PassportCreate = {
  number: string;
  date: string;
  unit_id: string;
  recycling_contract_id: string;
  transport_type: PassportTransportType;
  transport_contract_id?: string | null;
  status?: PassportStatus;
  waste_producer_id?: string | null;
  wastes: PassportWasteWrite[];
};

/** PATCH wastes: omit = не трогать; list = replace-all; [] → 400. */
export type PassportUpdate = Partial<PassportCreate>;

export const PassportSortFields = [
  "number",
  "date",
  "status",
  "transport_type",
  "created_at",
  "id",
] as const;
export type PassportSortField = (typeof PassportSortFields)[number];
export type PassportSortOrder = "asc" | "desc";

export type GetPassportsParams = {
  search?: string;
  status?: PassportStatus;
  transport_type?: PassportTransportType;
  unit_id?: string;
  recycling_contract_id?: string;
  date_from?: string;
  date_to?: string;
  sort?: PassportSortField;
  order?: PassportSortOrder;
  limit: number;
  offset: number;
};

export type PassportListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Passport[];
};

export const DEFAULT_PASSPORTS_LIST_LIMIT = 50;
