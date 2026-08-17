import type { UserProfile } from "../../../user";
import type { UnitBrief } from "../../units";
import type { WasteSourceBrief } from "../../waste-sources";
import type { WasteBrief } from "../../wastes";

export const OPERATION_TYPE_LABEL = {
  formed: "Образовано",
  used: "Использовано",
} as const;

export type OperationType = keyof typeof OPERATION_TYPE_LABEL;

export const OperationTypeValues = Object.keys(OPERATION_TYPE_LABEL) as [
  OperationType,
  ...OperationType[],
];

export type Balance = {
  id: string;
  tenant_id: string;
  date: string;
  unit: UnitBrief;
  waste: WasteBrief;
  amount: string;
};

export type BalanceBrief = Pick<Balance, "id" | "date" | "amount"> & {
  operation_id: string;
};

export type BalanceCurrent = {
  unit_id: string;
  waste_id: string;
  amount: string;
};

export type Operation = {
  id: string;
  tenant_id: string;
  date: string;
  operation_type: OperationType;
  unit_id: string;
  unit: UnitBrief;
  waste_id: string;
  waste: WasteBrief;
  waste_source_id: string | null;
  waste_source: WasteSourceBrief | null;
  amount: string;
  balance: BalanceBrief;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type OperationCreate = Pick<
  Operation,
  | "date"
  | "operation_type"
  | "unit_id"
  | "waste_id"
  | "waste_source_id"
  | "amount"
>;

export type OperationUpdate = Partial<OperationCreate>;

export type GetOperationsParams = {
  unit_id?: string;
  waste_id?: string;
  operation_type?: OperationType;
  date_from?: string;
  date_to?: string;
  limit: number;
  offset: number;
};

export type GetBalancesParams = {
  unit_id?: string;
  waste_id?: string;
  date_from?: string;
  date_to?: string;
  limit: number;
  offset: number;
};

export type GetCurrentBalanceParams = {
  unit_id: string;
  waste_id: string;
};

export type OperationListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Operation[];
};

export type BalanceListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Balance[];
};

export const DEFAULT_OPERATIONS_LIST_LIMIT = 50;
