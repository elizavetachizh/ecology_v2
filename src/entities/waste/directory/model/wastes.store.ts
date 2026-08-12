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
      return {
        ...waste,
        bindingId: binding.id,
        unitId: binding.unitId,
        pod9Id: binding.pod9Id,
        sourceId: binding.sourceId,
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




