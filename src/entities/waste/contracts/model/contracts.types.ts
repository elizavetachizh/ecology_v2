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

export const TRANSFER_PURPOSE_LABEL = {
  use: "Использование",
  neutralization: "Обезвреживание",
  storage: "Хранение",
  disposal: "Захоронение",
  sorting: "Сортировка",
  procurement: "Заготовка",
} as const;

export type TransferPurpose = keyof typeof TRANSFER_PURPOSE_LABEL;

export const TransferPurposeValues = Object.keys(TRANSFER_PURPOSE_LABEL) as [
  TransferPurpose,
  ...TransferPurpose[],
];

export const STORAGE_FACILITY_TYPE_LABEL = {
  sludge: "Шламохранилище (шламонакопитель)",
  landfill_toxic: "Полигон токсичных промышленных отходов",
  dump: "Отвал",
  insulation: "Объект хранения или активного  очистных сооружений",
  undeground_tank: "Подземный резервуар",
  temporary: "Место временного хранения",
  other: "Другое",
} as const;

export type StorageFacilityType = keyof typeof STORAGE_FACILITY_TYPE_LABEL;

export const StorageFacilityTypeValues = Object.keys(
  STORAGE_FACILITY_TYPE_LABEL,
) as [StorageFacilityType, ...StorageFacilityType[]];

export const DISPOSAL_FACILITY_TYPE_LABEL = {
  landfill_industrial: "Полигон промышленных отходов",
  landfill_toxic: "Полигон токсичных промышленных отходов",
  landfill_msw: "Полигон твёрдых коммунальных отходов",
  other: "Другое",
} as const;

export type DisposalFacilityType = keyof typeof DISPOSAL_FACILITY_TYPE_LABEL;

export const DisposalFacilityTypeValues = Object.keys(
  DISPOSAL_FACILITY_TYPE_LABEL,
) as [DisposalFacilityType, ...DisposalFacilityType[]];

export const CONTRACT_STATUS_LABEL = {
  active: "Действует",
  inactive: "Не действует",
} as const;

export const CONTRACT_ALL_STATUS_LABEL = {
  all: "Все",
  active: "Действующие",
  inactive: "Закрытые",
} as const;

export type ContractStatus = keyof typeof CONTRACT_STATUS_LABEL;

export type ContractAllStatus = "all" | ContractStatus;

export const ContractStatusValues = Object.keys(CONTRACT_STATUS_LABEL) as [
  ContractStatus,
  ...ContractStatus[],
];

export const ContractAllStatusValues = Object.keys(
  CONTRACT_ALL_STATUS_LABEL,
) as [ContractAllStatus, ...ContractAllStatus[]];

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

export type ContractWasteWrite = {
  waste_id: string;
  cost_per_unit?: string | null;
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
  counterparty_address: string | null;
  counterparty_contact: string | null;
  amount: string | null;
  with_ownership_transfer: boolean;
  transfer_purpose: TransferPurpose | null;
  storage_facility_type: StorageFacilityType | null;
  disposal_facility_type: DisposalFacilityType | null;
  wastes: ContractWaste[];
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** Nested in passport / TTN reads. */
export type ContractBrief = Pick<
  Contract,
  | "id"
  | "number"
  | "contract_type"
  | "status"
  | "counterparty"
  | "with_ownership_transfer"
  | "transfer_purpose"
>;

export type ContractCreate = {
  number: string;
  start_date: string;
  end_date?: string | null;
  contract_type: ContractType;
  status?: ContractStatus;
  counterparty_id: string;
  counterparty_address?: string | null;
  counterparty_contact?: string | null;
  amount?: string | null;
  with_ownership_transfer?: boolean;
  transfer_purpose?: TransferPurpose | null;
  storage_facility_type?: StorageFacilityType | null;
  disposal_facility_type?: DisposalFacilityType | null;
  wastes?: ContractWasteWrite[];
};

/** PATCH wastes: omit = не трогать; [] = очистить перечень. */
export type ContractUpdate = Partial<ContractCreate>;

export const ContractSortFields = [
  "number",
  "start_date",
  "end_date",
  "contract_type",
  "status",
  "created_at",
  "id",
] as const satisfies readonly (keyof Contract)[];
export type ContractSortField = (typeof ContractSortFields)[number];
export type ContractSortOrder = "asc" | "desc";

export type GetContractsParams = {
  search?: string;
  status?: ContractStatus;
  contract_type?: ContractType;
  counterparty_id?: string;
  waste_id?: string;
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
