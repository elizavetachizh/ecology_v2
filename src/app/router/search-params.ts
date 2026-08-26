import type { CounterpartySortField } from "../../entities/waste/counterparties";
import type {
  ContractSortField,
  ContractStatus,
  ContractType,
} from "../../entities/waste/contracts";
import type {
  InstructionSortField,
  InstructionStatus,
} from "../../entities/waste/instructions";
import type { OperationType } from "../../entities/waste/operations";
import type {
  PassportSortField,
  PassportStatus,
  PassportTransportType,
} from "../../entities/waste/passports";
import type { TtnSortField, TtnStatus } from "../../entities/waste/ttns";
import type { UnitSortField } from "../../entities/waste/units";
import type { WasteSourceSortField } from "../../entities/waste/waste-sources";
import type {
  HazardClass,
  PhysicalState,
  WasteSortField,
} from "../../entities/waste/wastes";
import type { AuthContextValue } from "../../shared/auth/auth.types";
import type { PersonSortField } from "../../entities/waste/persons";

export type RouterContext = {
  auth: AuthContextValue;
};

/** Общий кусок list-URL: q / sort / order / limit / offset */
export type ListSearchParams<TSort extends string> = {
  q?: string;
  sort?: TSort;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export type InstructionsSearch = ListSearchParams<InstructionSortField> & {
  status?: InstructionStatus;
};

export type WastesSearch = ListSearchParams<WasteSortField> & {
  hazard_class?: HazardClass;
  physical_state?: PhysicalState;
};

export type WasteSourcesSearch = ListSearchParams<WasteSourceSortField>;

export type PersonsSearch = ListSearchParams<PersonSortField>;

export type CounterpartiesSearch = ListSearchParams<CounterpartySortField> & {
  is_individual?: boolean;
  /** false = только неактивные; omit = только активные (`is_active=true` на API). */
  is_active?: boolean;
};

export type ContractsSearch = ListSearchParams<ContractSortField> & {
  status?: ContractStatus;
  contract_type?: ContractType;
  counterparty_id?: string;
};

/** Журнал операций: API не сортирует и не ищет, только фильтры + пагинация. */
export type OperationsSearch = {
  unit_id?: string;
  waste_id?: string;
  operation_type?: OperationType;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
};

export type PassportsSearch = ListSearchParams<PassportSortField> & {
  status?: PassportStatus;
  transport_type?: PassportTransportType;
  unit_id?: string;
  recycling_contract_id?: string;
  date_from?: string;
  date_to?: string;
};

export type TtnsSearch = ListSearchParams<TtnSortField> & {
  status?: TtnStatus;
  unit_id?: string;
  recycling_contract_id?: string;
  date_from?: string;
  date_to?: string;
};

export type CreatePassportSearch = {
  recycling_contract_id?: string;
};

export type CreateTtnSearch = {
  recycling_contract_id?: string;
};

/**
 * Структура: дерево по умолчанию; при is_pod9=true — плоский список журналов ПОД-9
 * (hierarchical=false) с пагинацией limit/offset.
 */
export type StructureSearch = {
  q?: string;
  sort?: UnitSortField;
  order?: "asc" | "desc";
  /** true = только журналы ПОД-9 (flat list) */
  is_pod9?: boolean;
  limit?: number;
  offset?: number;
  focusId?: string;
  expandId?: string;
};

export function parseSearchQuery(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function parseSearchOrder(value: unknown): "asc" | "desc" | undefined {
  return value === "asc" || value === "desc" ? value : undefined;
}

export function parseSearchLimit(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 200 ? Math.floor(n) : undefined;
}

export function parseSearchOffset(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
}

export function parseSearchEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  return typeof value === "string" &&
    (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

/** URL bool: true / "true" / false / "false"; иначе undefined (фильтр сброшен). */
export function parseSearchBoolean(value: unknown): boolean | undefined {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Дата в URL: строго YYYY-MM-DD, иначе фильтр сброшен (иначе 422 на API). */
export function parseSearchIsoDate(value: unknown): string | undefined {
  return typeof value === "string" && ISO_DATE_RE.test(value)
    ? value
    : undefined;
}
