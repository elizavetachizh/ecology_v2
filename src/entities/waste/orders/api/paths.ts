export function ordersCollectionPath(): string {
  return "/api/v1/mdm/orders";
}

export function orderItemPath(orderId: string): string {
  return `${ordersCollectionPath()}/${orderId}`;
}

export function orderStatesPath(orderId: string): string {
  return `${orderItemPath(orderId)}/states`;
}

export function orderStateItemPath(orderId: string, stateId: string): string {
  return `${orderStatesPath(orderId)}/${stateId}`;
}

export function unitResponsiblePath(unitId: string): string {
  return `/api/v1/mdm/units/${unitId}/responsible`;
}
