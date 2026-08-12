import type { UnitInstructionWasteScope } from "../model/uiw.types";

export function uiwCollectionPath(scope: UnitInstructionWasteScope): string {
  return `/api/v1/mdm/units/${scope.unitId}/instructions/${scope.instructionId}/wastes`;
}

export function uiwItemPath(
  scope: UnitInstructionWasteScope,
  bindingId: string,
): string {
  return `${uiwCollectionPath(scope)}/${bindingId}`;
}
