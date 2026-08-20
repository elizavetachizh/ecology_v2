import type { UnitInstructionWasteScope } from "../model/uiw.types";

export function unitInstructionsPath(unitId: string): string {
  return `/api/v1/mdm/units/${unitId}/instructions`;
}

export function uiwCollectionPath(scope: UnitInstructionWasteScope): string {
  return `${unitInstructionsPath(scope.unitId)}/${scope.instructionId}/wastes`;
}

export function uiwItemPath(
  scope: UnitInstructionWasteScope,
  bindingId: string,
): string {
  return `${uiwCollectionPath(scope)}/${bindingId}`;
}
