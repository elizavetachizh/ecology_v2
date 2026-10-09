export { createVehicle } from "./api/create-vehicle";
export { deleteVehicle } from "./api/delete-vehicle";
export { getVehicle } from "./api/get-vehicle";
export { getVehicles } from "./api/get-vehicles";
export { updateVehicle } from "./api/update-vehicle";
export type {
  GetVehiclesParams,
  Vehicle,
  VehicleAllStatus,
  VehicleBrief,
  VehicleCreate,
  VehicleListResponse,
  VehicleSortField,
  VehicleSortOrder,
  VehicleStatus,
  VehicleUpdate,
} from "./model/vehicles.types";
export {
  DEFAULT_VEHICLES_LIST_LIMIT,
  VEHICLE_ALL_STATUS_LABEL,
  VEHICLE_STATUS_BADGE_VARIANT,
  VEHICLE_STATUS_LABEL,
  VehicleAllStatusValues,
  VehicleSortFields,
  VehicleStatusValues,
} from "./model/vehicles.types";
export { vehiclesQueryKeys } from "./model/vehicles-query-keys";
export { useVehiclesListQuery } from "./model/use-vehicles-list-query";
export { VehicleStatusBadge } from "./ui/VehicleStatusBadge";
