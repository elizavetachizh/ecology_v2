import type { UserProfile } from "../../../user";

export const VEHICLE_STATUS_LABEL = {
  active: "Активное",
  inactive: "Неактивное",
} as const;

export const VEHICLE_ALL_STATUS_LABEL = {
  all: "Все",
  active: "Активные",
  inactive: "Неактивные",
} as const;

export type VehicleStatus = keyof typeof VEHICLE_STATUS_LABEL;
export type VehicleAllStatus = keyof typeof VEHICLE_ALL_STATUS_LABEL;

export const VehicleStatusValues = Object.keys(VEHICLE_STATUS_LABEL) as [
  VehicleStatus,
  ...VehicleStatus[],
];

export const VehicleAllStatusValues = Object.keys(VEHICLE_ALL_STATUS_LABEL) as [
  VehicleAllStatus,
  ...VehicleAllStatus[],
];

export const VEHICLE_STATUS_BADGE_VARIANT: Record<
  VehicleStatus,
  "success" | "secondary"
> = {
  active: "success",
  inactive: "secondary",
};

/** VehicleRead — ответ backend */
export type Vehicle = {
  id: string;
  tenant_id: string;
  make: string;
  model: string;
  license_plate: string;
  weight: number | null;
  status: VehicleStatus;
  beltopgas_id: number | null;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

/** Nested там, где есть FK на транспорт. Без tenant и аудита. */
export type VehicleBrief = Pick<
  Vehicle,
  | "id"
  | "make"
  | "model"
  | "license_plate"
  | "weight"
  | "status"
  | "beltopgas_id"
>;

export type VehicleCreate = {
  make: string;
  model: string;
  license_plate: string;
  weight?: number | null;
  status?: VehicleStatus;
  beltopgas_id?: number | null;
};

export type VehicleUpdate = Partial<VehicleCreate>;

export type VehicleListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Vehicle[];
};

export const VehicleSortFields = [
  "make",
  "model",
  "license_plate",
  "weight",
  "status",
  "created_at",
  "id",
] as const;
export type VehicleSortField = (typeof VehicleSortFields)[number];
export type VehicleSortOrder = "asc" | "desc";

export type GetVehiclesParams = {
  search?: string;
  status?: VehicleStatus;
  sort?: VehicleSortField;
  order?: VehicleSortOrder;
  limit: number;
  offset: number;
};

export const DEFAULT_VEHICLES_LIST_LIMIT = 50;
export const DEFAULT_VEHICLES_OPTIONS_LIMIT = 20;
