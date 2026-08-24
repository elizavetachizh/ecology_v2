import type { UserProfile } from "../../../user";
import type { CounterpartyBrief } from "../../counterparties";
import type { WasteBrief } from "../../wastes";

export const CONTRACT_TYPE_LABEL = {
  recycling: "Утилизация",
  transport: "Перевозка",
} as const;

export type ContractType = keyof typeof CONTRACT_TYPE_LABEL;

export const ContractTypeValues = Object.keys(CONTRACT_TYPE_LABEL) as [
  ContractType,
  ...ContractType[],
];

export const CONTRACT_STATUS_LABEL = {
  active: "Действует",
  inactive: "Не действует",
} as const;

export type ContractStatus = keyof typeof CONTRACT_STATUS_LABEL;

export const ContractStatusValues = Object.keys(CONTRACT_STATUS_LABEL) as [
  ContractStatus,
  ...ContractStatus[],
];

export const CONTRACT_STATUS_BADGE_VARIANT: Record<
  ContractStatus,
  "success" | "secondary"
> = {
  active: "success",
  inactive: "secondary",
};

/** ContractWasteRead */
export type ContractWaste = {
  id: string;
  tenant_id: string;
  contract_id: string;
  waste_id: string;
  waste: WasteBrief;
  cost_per_unit: string | null;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** ContractRead */
export type Contract = {
  id: string;
  tenant_id: string;
  number: string;
  start_date: string;
  end_date: string | null;
  contract_type: ContractType;
  status: ContractStatus;
  counterparty_id: string;
  counterparty: CounterpartyBrief;
  amount: string | null;
  wastes: ContractWaste[];
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** Nested in passport / TTN reads. */
export type ContractBrief = {
  id: string;
  number: string;
  contract_type: ContractType;
  status: ContractStatus;
  counterparty: CounterpartyBrief;
};

export type ContractWasteWrite = {
  waste_id: string;
  cost_per_unit?: string | null;
};

export type ContractCreate = {
  number: string;
  start_date: string;
  end_date?: string | null;
  contract_type: ContractType;
  status?: ContractStatus;
  counterparty_id: string;
  amount?: string | null;
  wastes?: ContractWasteWrite[];
};

/** PATCH wastes: omit = не трогать; [] = очистить перечень. */
export type ContractUpdate = {
  number?: string;
  start_date?: string;
  end_date?: string | null;
  contract_type?: ContractType;
  status?: ContractStatus;
  counterparty_id?: string;
  amount?: string | null;
  wastes?: ContractWasteWrite[];
};

export const ContractSortFields = [
  "number",
  "start_date",
  "end_date",
  "contract_type",
  "status",
  "created_at",
  "id",
] as const;
export type ContractSortField = (typeof ContractSortFields)[number];
export type ContractSortOrder = "asc" | "desc";

export type GetContractsParams = {
  search?: string;
  status?: ContractStatus;
  contract_type?: ContractType;
  counterparty_id?: string;
  sort?: ContractSortField;
  order?: ContractSortOrder;
  limit: number;
  offset: number;
};

export type ContractListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Contract[];
};

export const DEFAULT_CONTRACTS_LIST_LIMIT = 50;
export const DEFAULT_CONTRACTS_OPTIONS_LIMIT = 20;
