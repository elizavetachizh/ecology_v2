import type { UserProfile } from "../../../user";
import type { UnitBrief } from "../../units";

export const ORDER_STATUS_LABEL = {
  active: "Действует",
  inactive: "Не действует",
} as const;

export const ORDER_ALL_STATUS_LABEL = {
  all: "Все",
  active: "Действующие",
  inactive: "Недействующие",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_LABEL;
export type OrderAllStatus = keyof typeof ORDER_ALL_STATUS_LABEL;

export const OrderStatusValues = Object.keys(ORDER_STATUS_LABEL) as [
  OrderStatus,
  ...OrderStatus[],
];

export const OrderAllStatusValues = Object.keys(ORDER_ALL_STATUS_LABEL) as [
  OrderAllStatus,
  ...OrderAllStatus[],
];

export const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "success" | "secondary"
> = {
  active: "success",
  inactive: "secondary",
};

/** Приказ без unit_id действует на все подразделения тенанта. */
export const ORDER_TENANT_WIDE_UNIT_LABEL = "Все подразделения";

export function orderUnitLabel(unit: UnitBrief | null | undefined): string {
  if (!unit) return ORDER_TENANT_WIDE_UNIT_LABEL;
  return unit.short_name ?? unit.name;
}

/** OrderRead */
export type Order = {
  id: string;
  tenant_id: string;
  number: string;
  start_date: string;
  status: OrderStatus;
  unit_id: string | null;
  unit: UnitBrief | null;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type OrderCreate = {
  number: string;
  start_date: string;
  unit_id?: string | null;
};

export type OrderUpdate = Partial<OrderCreate>;

export const OrderSortFields = [
  "number",
  "start_date",
  "status",
  "created_at",
  "id",
] as const;
export type OrderSortField = (typeof OrderSortFields)[number];
export type OrderSortOrder = "asc" | "desc";

export type GetOrdersParams = {
  search?: string;
  status?: OrderStatus;
  unit_id?: string;
  sort?: OrderSortField;
  order?: OrderSortOrder;
  limit: number;
  offset: number;
};

export type OrderListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Order[];
};

export const DEFAULT_ORDERS_LIST_LIMIT = 50;
