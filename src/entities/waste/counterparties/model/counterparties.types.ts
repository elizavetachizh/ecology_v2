import type { UserProfile } from "../../../user";

/** УНП: ровно 9 цифр. Пустая строка на write → null на backend. */
export const COUNTERPARTY_UNP_PATTERN = /^\d{9}$/;

/** CounterpartyRead — ответ backend */
export type Counterparty = {
  id: string;
  tenant_id: string;
  name: string;
  full_name: string | null;
  unp: string | null;
  address: string | null;
  contact: string | null;
  is_active: boolean;
  is_individual: boolean;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type CounterpartyBrief = Pick<Counterparty, "id" | "name">;

export type CounterpartyCreate = {
  name: string;
  full_name?: string | null;
  unp?: string | null;
  address?: string | null;
  contact?: string | null;
  is_active?: boolean;
  is_individual?: boolean;
};

export type CounterpartyUpdate = Partial<CounterpartyCreate>;

export type CounterpartyListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Counterparty[];
};

export const CounterpartySortFields = [
  "name",
  "unp",
  "full_name",
  "created_at",
  "id",
] as const;
export type CounterpartySortField = (typeof CounterpartySortFields)[number];
export type CounterpartySortOrder = "asc" | "desc";

export type GetCounterpartiesParams = {
  search?: string;
  is_individual?: boolean;
  is_active?: boolean;
  sort?: CounterpartySortField;
  order?: CounterpartySortOrder;
  limit: number;
  offset: number;
};

export const DEFAULT_COUNTERPARTIES_LIST_LIMIT = 50;
export const DEFAULT_COUNTERPARTIES_OPTIONS_LIMIT = 20;
