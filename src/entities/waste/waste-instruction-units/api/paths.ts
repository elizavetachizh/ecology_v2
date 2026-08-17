import type { WasteInstructionUnitScope } from "../model/wiu.types";

export function wiuCollectionPath(scope: WasteInstructionUnitScope): string {
  return `/api/v1/mdm/wastes/${scope.wasteId}/instructions/${scope.instructionId}/units`;
}

export function wiuItemPath(
  scope: WasteInstructionUnitScope,
  bindingId: string,
): string {
  return `${wiuCollectionPath(scope)}/${bindingId}`;
}
