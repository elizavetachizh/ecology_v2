import type { UserProfile } from "../../../user";
import type { PersonBrief } from "../../persons";
import type { UnitBrief } from "../../units";

/** OrderBrief — вложен в as-of ответы. */
export type OrderBrief = {
  id: string;
  number: string;
  date: string;
};

export type OrderStateItemWrite = {
  unit_id: string;
  person_id: string;
};

export type OrderStateWrite = {
  start_date: string;
  items?: OrderStateItemWrite[];
};

/** OrderStateItemRead */
export type OrderStateItem = {
  id: string;
  tenant_id: string;
  order_state_id: string;
  unit_id: string;
  person_id: string;
  start_date: string;
  unit: UnitBrief;
  person: PersonBrief;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** OrderStateRead */
export type OrderState = {
  id: string;
  tenant_id: string;
  order_id: string;
  start_date: string;
  items: OrderStateItem[];
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

type OrderHeader = {
  id: string;
  tenant_id: string;
  number: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** OrderListItem — список без nested states. */
export type OrderListItem = OrderHeader;

/** OrderRead — полный агрегат со states/items. */
export type Order = OrderHeader & {
  states: OrderState[];
};

export type OrderCreate = {
  number: string;
  date: string;
  state: OrderStateWrite;
};

export type OrderUpdate = {
  number?: string;
  date?: string;
};

/** PATCH items — полная замена списка. omit items = не трогать. */
export type OrderStateUpdate = {
  start_date?: string;
  items?: OrderStateItemWrite[];
};

export type OrderListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: OrderListItem[];
};

export const OrderSortFields = [
  "number",
  "date",
  "created_at",
  "id",
] as const;
export type OrderSortField = (typeof OrderSortFields)[number];
export type OrderSortOrder = "asc" | "desc";

export type GetOrdersParams = {
  search?: string;
  sort?: OrderSortField;
  order?: OrderSortOrder;
  limit: number;
  offset: number;
};

export type GetUnitResponsibleParams = {
  unitId: string;
  on?: string;
};

/** UnitResponsibleRead / PersonAssignmentItem — один снимок as-of. */
export type OrderAssignmentSnapshot = {
  order: OrderBrief;
  state: OrderState;
  item: OrderStateItem;
};

export type UnitResponsible = OrderAssignmentSnapshot;
export type PersonAssignmentItem = OrderAssignmentSnapshot;

/** PersonAssignmentsRead */
export type PersonAssignments = {
  items: PersonAssignmentItem[];
};

export const DEFAULT_ORDERS_LIST_LIMIT = 50;
