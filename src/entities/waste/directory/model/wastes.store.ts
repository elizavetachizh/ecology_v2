import { findFormationSource } from "../../formation-source";
// TODO: перенести structure в entities — убрать зависимость entity → pages
import {
  findParentId,
  findStructureNode,
  getStructureTree,
} from "../../../../pages/dashboard/directories/model/structure.store";
import type {
  DirectoryWaste,
  Pod9Waste,
  WasteBinding,
  WasteFormValues,
} from "./waste.types";

type Listener = () => void;

const MOCK_WASTES: DirectoryWaste[] = [
  {
    id: "w-1",
    instructionId: "instr-demo-2026",
    classifierId: "1",
    code: 9120400,
    name: "Мусор от офисных и бытовых помещений организаций",
    hazardClass: "IV",
    unit: "т",
  },
  {
    id: "w-2",
    instructionId: "instr-demo-2026",
    classifierId: "2",
    code: 1870600,
    name: "Отходы бумаги и картона от канцелярской деятельности",
    hazardClass: "V",
    unit: "т",
  },
  {
    id: "w-3",
    instructionId: "instr-demo-2026",
    classifierId: "3",
    code: 5470100,
    name: "Обтирочный материал, загрязненный нефтью или нефтепродуктами",
    hazardClass: "III",
    unit: "т",
  },
];

const MOCK_BINDINGS: WasteBinding[] = [
  {
    id: "wb-1",
    instructionId: "instr-demo-2026",
    wasteId: "w-1",
    unitId: "unit-1-1",
    pod9Id: "pod9-1",
    sourceId: "src-1",
  },
  {
    id: "wb-1b",
    instructionId: "instr-demo-2026",
    wasteId: "w-1",
    unitId: "unit-1-2",
    pod9Id: "pod9-3",
    sourceId: "src-1",
  },
  {
    id: "wb-2",
    instructionId: "instr-demo-2026",
    wasteId: "w-2",
    unitId: "unit-1-1",
    pod9Id: "pod9-1",
    sourceId: "src-2",
  },
  {
    id: "wb-3",
    instructionId: "instr-demo-2026",
    wasteId: "w-3",
    unitId: "unit-2-1",
    pod9Id: "pod9-4",
    sourceId: "src-3",
  },
];

let wastes: DirectoryWaste[] = [...MOCK_WASTES];
let bindings: WasteBinding[] = [...MOCK_BINDINGS];
/** Версия store — стабильный snapshot для useSyncExternalStore */
let storeVersion = 0;
const listeners = new Set<Listener>();

function emit() {
  storeVersion += 1;
  listeners.forEach((listener) => listener());
}

export function getAllWastes(): DirectoryWaste[] {
  return wastes;
}

export function getWastesByInstruction(
  instructionId: string | null,
): DirectoryWaste[] {
  if (!instructionId) return [];
  return wastes.filter((item) => item.instructionId === instructionId);
}

export function findWaste(id: string): DirectoryWaste | null {
  return wastes.find((item) => item.id === id) ?? null;
}

export function getWasteBindings(
  wasteId: string,
  instructionId?: string | null,
): WasteBinding[] {
  return bindings.filter(
    (item) =>
      item.wasteId === wasteId &&
      (instructionId === undefined || item.instructionId === instructionId),
  );
}

export function getAllBindings(): WasteBinding[] {
  return bindings;
}

export function getPod9Wastes(
  pod9Id: string,
  instructionId?: string | null,
): Pod9Waste[] {
  return bindings
    .filter(
      (item) =>
        item.pod9Id === pod9Id &&
        (instructionId === undefined || item.instructionId === instructionId),
    )
    .map((binding) => {
      const waste = findWaste(binding.wasteId);
      if (!waste) return null;
      const source = findFormationSource(binding.sourceId);
      return {
        ...waste,
        bindingId: binding.id,
        unitId: binding.unitId,
        pod9Id: binding.pod9Id,
        sourceId: binding.sourceId,
        sourceName: source?.name ?? "—",
      };
    })
    .filter((item): item is Pod9Waste => item !== null);
}

export function subscribeWastes(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetWastesStore() {
  wastes = [...MOCK_WASTES];
  bindings = [...MOCK_BINDINGS];
  emit();
}

export const subscribePod9Wastes = subscribeWastes;

export function getWastesSnapshot(): DirectoryWaste[] {
  return wastes;
}

/**
 * Стабильный snapshot (число). Нельзя возвращать новый объект на каждый вызов —
 * иначе useSyncExternalStore уходит в бесконечный ререндер.
 */
export function getPod9WastesSnapshot(): number {
  return storeVersion;
}

export function createWaste(
  values: WasteFormValues,
  instructionId: string,
): DirectoryWaste {
  const waste: DirectoryWaste = {
    id: `w-${crypto.randomUUID().slice(0, 8)}`,
    instructionId,
    classifierId: values.classifierId.trim(),
    code: values.code,
    name: values.name.trim(),
    hazardClass: values.hazardClass.trim(),
    unit: values.unit.trim(),
  };

  wastes = [waste, ...wastes];
  emit();
  return waste;
}

export function updateWaste(
  id: string,
  values: WasteFormValues,
): DirectoryWaste | null {
  const index = wastes.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const next: DirectoryWaste = {
    ...wastes[index]!,
    classifierId: values.classifierId.trim(),
    code: values.code,
    name: values.name.trim(),
    hazardClass: values.hazardClass.trim(),
    unit: values.unit.trim(),
  };

  wastes = [...wastes.slice(0, index), next, ...wastes.slice(index + 1)];
  emit();
  return next;
}

export function deleteWaste(id: string): boolean {
  const next = wastes.filter((item) => item.id !== id);
  if (next.length === wastes.length) return false;
  wastes = next;
  bindings = bindings.filter((item) => item.wasteId !== id);
  emit();
  return true;
}

export function addWasteBinding(input: {
  wasteId: string;
  unitId: string;
  pod9Id: string;
  sourceId: string;
}): WasteBinding | null {
  const waste = findWaste(input.wasteId);
  const pod9 = findStructureNode(getStructureTree(), input.pod9Id);
  const source = findFormationSource(input.sourceId);
  if (!waste || !pod9 || pod9.type !== "pod9" || !source) {
    return null;
  }

  const duplicate = bindings.some(
    (item) =>
      item.wasteId === input.wasteId &&
      item.unitId === input.unitId &&
      item.pod9Id === input.pod9Id &&
      item.sourceId === input.sourceId,
  );
  if (duplicate) return null;

  const binding: WasteBinding = {
    id: `wb-${crypto.randomUUID().slice(0, 8)}`,
    instructionId: waste.instructionId,
    wasteId: input.wasteId,
    unitId: input.unitId,
    pod9Id: input.pod9Id,
    sourceId: input.sourceId,
  };

  bindings = [...bindings, binding];
  emit();
  return binding;
}

export function removeWasteBinding(bindingId: string) {
  bindings = bindings.filter((item) => item.id !== bindingId);
  emit();
}

export function removeBindingsForStructureNodes(nodeIds: string[]) {
  const ids = new Set(nodeIds);
  const next = bindings.filter(
    (item) => !ids.has(item.unitId) && !ids.has(item.pod9Id),
  );
  if (next.length === bindings.length) return;
  bindings = next;
  emit();
}

/**
 * С карточки ПОД-9: создаёт отход в справочнике и сразу привязывает
 * (отход сначала появляется в каталоге, затем binding).
 */
export function addPod9Waste(
  pod9Id: string,
  instructionId: string,
  values: WasteFormValues,
  sourceId: string,
): Pod9Waste | null {
  const unitId = findParentId(getStructureTree(), pod9Id);
  const pod9 = findStructureNode(getStructureTree(), pod9Id);
  if (typeof unitId !== "string" || !pod9 || pod9.type !== "pod9") {
    return null;
  }

  const waste = createWaste(values, instructionId);
  const binding = addWasteBinding({
    wasteId: waste.id,
    unitId,
    pod9Id,
    sourceId,
  });
  if (!binding) return null;

  const source = findFormationSource(sourceId);
  return {
    ...waste,
    bindingId: binding.id,
    unitId,
    pod9Id,
    sourceId,
    sourceName: source?.name ?? "—",
  };
}

/** Привязать уже существующий отход к ПОД-9 с источником образования */
export function bindExistingWasteToPod9(
  wasteId: string,
  pod9Id: string,
  sourceId: string,
): WasteBinding | null {
  const unitId = findParentId(getStructureTree(), pod9Id);
  if (typeof unitId !== "string") return null;
  return addWasteBinding({ wasteId, unitId, pod9Id, sourceId });
}

export function formatBindingLabels(binding: WasteBinding): {
  unitLabel: string;
  pod9Label: string;
  sourceLabel: string;
} {
  const tree = getStructureTree();
  const unit = findStructureNode(tree, binding.unitId);
  const pod9 = findStructureNode(tree, binding.pod9Id);
  const source = findFormationSource(binding.sourceId);

  return {
    unitLabel: unit ? `${unit.name}${unit.code ? ` (${unit.code})` : ""}` : "—",
    pod9Label: pod9
      ? `${pod9.name}${pod9.period ? ` · ${pod9.period}` : ""}`
      : "—",
    sourceLabel: source?.name ?? "—",
  };
}
