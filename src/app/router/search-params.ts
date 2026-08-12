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

/** Дерево структуры: без пагинации, с focus/expand */
export type StructureSearch = {
  q?: string;
  sort?: UnitSortField;
  order?: "asc" | "desc";
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
