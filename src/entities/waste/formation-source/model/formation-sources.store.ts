import type {
  FormationSource,
  FormationSourceFormValues,
} from "./formation-source.types";

type Listener = () => void;

const MOCK_SOURCES: FormationSource[] = [
  { id: "src-1", name: "Административное здание" },
  { id: "src-2", name: "Офисные помещения" },
  { id: "src-3", name: "Производственный корпус А" },
];

let sources: FormationSource[] = [...MOCK_SOURCES];
let storeVersion = 0;
const listeners = new Set<Listener>();

function emit() {
  storeVersion += 1;
  listeners.forEach((listener) => listener());
}

export function getFormationSources(): FormationSource[] {
  return sources;
}

export function findFormationSource(id: string): FormationSource | null {
  return sources.find((item) => item.id === id) ?? null;
}

export function subscribeFormationSources(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFormationSourcesSnapshot(): number {
  return storeVersion;
}

export function resetFormationSourcesStore() {
  sources = [...MOCK_SOURCES];
  emit();
}

export function createFormationSource(
  values: FormationSourceFormValues,
): FormationSource {
  const name = values.name.trim();
  const existing = sources.find(
    (item) => item.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing;

  const source: FormationSource = {
    id: `src-${crypto.randomUUID().slice(0, 8)}`,
    name,
  };
  sources = [source, ...sources];
  emit();
  return source;
}

export function updateFormationSource(
  id: string,
  values: FormationSourceFormValues,
): FormationSource | null {
  const index = sources.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const next: FormationSource = {
    ...sources[index]!,
    name: values.name.trim(),
  };
  sources = [...sources.slice(0, index), next, ...sources.slice(index + 1)];
  emit();
  return next;
}

export function deleteFormationSource(id: string): boolean {
  const next = sources.filter((item) => item.id !== id);
  if (next.length === sources.length) return false;
  sources = next;
  emit();
  return true;
}
