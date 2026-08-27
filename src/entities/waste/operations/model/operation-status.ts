import type { OperationStatus } from "./operations.types";

export function canReviewOperation(status: OperationStatus) {
  return status === "confirmation_required";
}

export function canMutateOperation(status: OperationStatus) {
  return status !== "declined";
}
