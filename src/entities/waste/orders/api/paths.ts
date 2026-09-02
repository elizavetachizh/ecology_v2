export function ordersCollectionPath(): string {
  return "/api/v1/mdm/orders";
}

export function orderItemPath(orderId: string): string {
  return `${ordersCollectionPath()}/${orderId}`;
}
