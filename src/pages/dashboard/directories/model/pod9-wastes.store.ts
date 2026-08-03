import { DEFAULT_INSTRUCTION_ID } from "../../../../entities/regulatory-document";
import {
  findParentId,
  findStructureNode,
  getStructureTree,
} from "./structure.store";

/** Карточка отхода в справочнике (без привязок) */
export type DirectoryWaste = {
  id: string;
  instructionId: string;
  name: string;
  hazardClass: string;
  unit: string;
  source: string;
};

/** Привязка: один отход → много единиц и ПОД-9 */
export type WasteBinding = {
  id: string;
  instructionId: string;
  wasteId: string;
  unitId: string;
  pod9Id: string;
};

export type WasteFormValues = {
  name: string;
  hazardClass: string;
  unit: string;
  source: string;
};

/** @deprecated alias for POD-9 section form */
export type Pod9WasteFormValues = WasteFormValues;

/** Строка таблицы на карточке ПОД-9 */
export type Pod9Waste = DirectoryWaste & {
  bindingId: string;
  unitId: string;
  pod9Id: string;
};

export const HAZARD_CLASS_OPTIONS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
] as const;

export const WASTE_UNIT_OPTIONS = ["т", "кг", "м³", "л", "шт"] as const;

export function emptyWasteForm(): WasteFormValues {
  return {
    name: "",
    hazardClass: "IV",
    unit: "т",
    source: "",
  };
}

export const emptyPod9WasteForm = emptyWasteForm;

type Listener = () => void;

const MOCK_WASTES: DirectoryWaste[] = [
  {
    id: "w-1",
    instructionId: DEFAULT_INSTRUCTION_ID,
    name: "Мусор от офисных и бытовых помещений организаций",
    hazardClass: "IV",
    unit: "т",
    source: "Административное здание",
  },
  {
    id: "w-2",
    instructionId: DEFAULT_INSTRUCTION_ID,
    name: "Отходы бумаги и картона от канцелярской деятельности",
    hazardClass: "V",
    unit: "т",
    source: "Офисные помещения",
  },
  {
    id: "w-3",
    instructionId: DEFAULT_INSTRUCTION_ID,
    name: "Обтирочный материал, загрязненный нефтью или нефтепродуктами",
    hazardClass: "III",
    unit: "т",
    source: "Производственный корпус А",
  },
];

const MOCK_BINDINGS: WasteBinding[] = [
  {
    id: "wb-1",
    instructionId: DEFAULT_INSTRUCTION_ID,
    wasteId: "w-1",
    unitId: "unit-1-1",
    pod9Id: "pod9-1",
  },
  {
    id: "wb-1b",
    instructionId: DEFAULT_INSTRUCTION_ID,
    wasteId: "w-1",
    unitId: "unit-1-2",
    pod9Id: "pod9-3",
  },
  {
    id: "wb-2",
    instructionId: DEFAULT_INSTRUCTION_ID,
    wasteId: "w-2",
    unitId: "unit-1-1",
    pod9Id: "pod9-1",
  },
  {
    id: "wb-3",
    instructionId: DEFAULT_INSTRUCTION_ID,
    wasteId: "w-3",
    unitId: "unit-2-1",
    pod9Id: "pod9-4",
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
      return {
        ...waste,
        bindingId: binding.id,
        unitId: binding.unitId,
        pod9Id: binding.pod9Id,
      };
    })
    .filter((item): item is Pod9Waste => item !== null);
}

export function subscribeWastes(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
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
    name: values.name.trim(),
    hazardClass: values.hazardClass.trim(),
    unit: values.unit.trim(),
    source: values.source.trim(),
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
    name: values.name.trim(),
    hazardClass: values.hazardClass.trim(),
    unit: values.unit.trim(),
    source: values.source.trim(),
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
}): WasteBinding | null {
  const waste = findWaste(input.wasteId);
  const pod9 = findStructureNode(getStructureTree(), input.pod9Id);
  if (
    !waste ||
    !pod9 ||
    pod9.type !== "pod9"
  ) {
    return null;
  }

  const duplicate = bindings.some(
    (item) =>
      item.wasteId === input.wasteId &&
      item.unitId === input.unitId &&
      item.pod9Id === input.pod9Id,
  );
  if (duplicate) return null;

  const binding: WasteBinding = {
    id: `wb-${crypto.randomUUID().slice(0, 8)}`,
    instructionId: waste.instructionId,
    wasteId: input.wasteId,
    unitId: input.unitId,
    pod9Id: input.pod9Id,
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
): Pod9Waste | null {
  const unitId = findParentId(getStructureTree(), pod9Id);
  const pod9 = findStructureNode(getStructureTree(), pod9Id);
  if (
    typeof unitId !== "string" ||
    !pod9 ||
    pod9.type !== "pod9"
  ) {
    return null;
  }

  const waste = createWaste(values, instructionId);
  const binding = addWasteBinding({
    wasteId: waste.id,
    unitId,
    pod9Id,
  });
  if (!binding) return null;

  return {
    ...waste,
    bindingId: binding.id,
    unitId,
    pod9Id,
  };
}

/** Привязать уже существующий отход к ПОД-9 */
export function bindExistingWasteToPod9(
  wasteId: string,
  pod9Id: string,
): WasteBinding | null {
  const unitId = findParentId(getStructureTree(), pod9Id);
  if (typeof unitId !== "string") return null;
  return addWasteBinding({ wasteId, unitId, pod9Id });
}

export function formatBindingLabels(binding: WasteBinding): {
  unitLabel: string;
  pod9Label: string;
} {
  const tree = getStructureTree();
  const unit = findStructureNode(tree, binding.unitId);
  const pod9 = findStructureNode(tree, binding.pod9Id);

  return {
    unitLabel: unit
      ? `${unit.name}${unit.code ? ` (${unit.code})` : ""}`
      : "—",
    pod9Label: pod9
      ? `${pod9.name}${pod9.period ? ` · ${pod9.period}` : ""}`
      : "—",
  };
}
