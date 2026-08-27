import type { UserProfile } from "../../../user";
import type { CounterpartyBrief } from "../../counterparties";
import type { PassportBrief } from "../../passports";
import type { TtnBrief } from "../../ttns";
import type { UnitBrief } from "../../units";
import type { WasteSourceBrief } from "../../waste-sources";
import type { WasteBrief } from "../../wastes";

export const OPERATION_TYPE_LABEL = {
  formed: "Образовано",
  used: "Использовано",
  neutralized: "Обезврежено",
  received_in: "Поступило от структурного подразделения",
  transferred_in: "Передано структурному подразделению",
  received_out: "Поступило от контрагента",
  transferred_out: "Вывезено",
} as const;

export const USE_PURPOSE_LABEL = {
  energy: "Для производства энергии",
  product: "Для производства продукции",
  service: "Для выполнения работ/оказания услуг",
  rdf: "Для производства RDF-топлива",
  insulation: "В качестве изолир. мат. при захоронении ТКО",
  reclamation: "В качестве материала для рекультивации земель",
} as const;

export const OPERATION_STATUS_LABEL = {
  confirmed: "Подтверждено",
  pending: "Ожидает подтверждения",
  confirmation_required: "Требует подтверждения",
  declined: "Отклонено",
} as const;

export const OPERATION_STATUS_BADGE_VARIANT: Record<
  keyof typeof OPERATION_STATUS_LABEL,
  "success" | "warning" | "info" | "destructive"
> = {
  confirmed: "success",
  pending: "warning",
  confirmation_required: "info",
  declined: "destructive",
};

export const NEUTRALIZATION_METHOD_LABEL = {
  thermal: "Термический способ",
  physicochemical: "Физико-химический способ",
  electrochemical: "Электрохимический способ",
  immobilization: "Иммобилизация",
  chemical: "Химический способ",
  restorative: "Восстановительный способ",
  membrane: "Мембранный способ",
  biological: "Биологический способ",
  other: "Другой способ",
} as const;

export const TRANSFER_RECEIPT_PURPOSE_LABEL = {
  use: "Использование",
  neutralization: "Обезвреживание",
  storage: "Для хранения",
  disposal: "Для утилизации",
} as const;

export type OperationType = keyof typeof OPERATION_TYPE_LABEL;
export type OperationStatus = keyof typeof OPERATION_STATUS_LABEL;
export type UsePurpose = keyof typeof USE_PURPOSE_LABEL;
export type NeutralizationMethod = keyof typeof NEUTRALIZATION_METHOD_LABEL;
export type TransferReceiptPurpose =
  keyof typeof TRANSFER_RECEIPT_PURPOSE_LABEL;

export const OperationTypeValues = Object.keys(OPERATION_TYPE_LABEL) as [
  OperationType,
  ...OperationType[],
];

export const OperationStatusValues = Object.keys(OPERATION_STATUS_LABEL) as [
  OperationStatus,
  ...OperationStatus[],
];

export const UsePurposeValues = Object.keys(USE_PURPOSE_LABEL) as [
  UsePurpose,
  ...UsePurpose[],
];

export const NeutralizationMethodValues = Object.keys(
  NEUTRALIZATION_METHOD_LABEL,
) as [NeutralizationMethod, ...NeutralizationMethod[]];

export const TransferReceiptPurposeValues = Object.keys(
  TRANSFER_RECEIPT_PURPOSE_LABEL,
) as [TransferReceiptPurpose, ...TransferReceiptPurpose[]];

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
  status: OperationStatus;
  linked_operation_id: string | null;
  unit_id: string;
  unit: UnitBrief;
  unit_side_id: string | null;
  unit_side: UnitBrief | null;
  waste_id: string;
  waste: WasteBrief;
  waste_source_id: string | null;
  waste_source: WasteSourceBrief | null;
  use_purpose: UsePurpose | null;
  neutralization_method: NeutralizationMethod | null;
  transfer_receipt_purpose: TransferReceiptPurpose | null;
  counterparty_id: string | null;
  counterparty: CounterpartyBrief | null;
  passport_id: string | null;
  passport: PassportBrief | null;
  ttn_id: string | null;
  ttn: TtnBrief | null;
  amount: string;
  balance: BalanceBrief | null;
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
  | "unit_side_id"
  | "waste_id"
  | "waste_source_id"
  | "use_purpose"
  | "neutralization_method"
  | "transfer_receipt_purpose"
  | "counterparty_id"
  | "passport_id"
  | "ttn_id"
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
