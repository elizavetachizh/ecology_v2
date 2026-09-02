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

/** OrderRead */
export type Order = {
  id: string;
  tenant_id: string;
  number: string;
  start_date: string;
  status: OrderStatus;
  unit_id: string;
  unit: UnitBrief;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type OrderCreate = {
  number: string;
  start_date: string;
  unit_id: string;
};

export type OrderUpdate = {
  number?: string;
  start_date?: string;
  unit_id?: string;
};

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
