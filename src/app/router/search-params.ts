import type {
  InstructionSortField,
  InstructionStatus,
} from "../../entities/waste/instructions";
import type { UnitSortField } from "../../entities/waste/units";
import type { WasteSourceSortField } from "../../entities/waste/waste-sources";
import type {
  HazardClass,
  PhysicalState,
  WasteSortField,
} from "../../entities/waste/wastes";
import type { AuthContextValue } from "../../shared/auth/auth.types";

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
