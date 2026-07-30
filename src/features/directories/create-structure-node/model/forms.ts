export type UnitFormValues = {
  name: string;
  code: string;
};

export type Pod9FormValues = {
  name: string;
  period: string;
  status: string;
  responsible: string;
};

export function emptyUnitForm(): UnitFormValues {
  return { name: "", code: "" };
}

export function emptyPod9Form(): Pod9FormValues {
  return {
    name: "Журнал ПОД-9",
    period: "",
    status: "Черновик",
    responsible: "",
  };
}

export const POD9_STATUS_OPTIONS = [
  "Черновик",
  "Не сформирован",
  "Требует проверки",
  "Сформирован",
] as const;

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function saveUnitApi(values: UnitFormValues, existingId?: string) {
  await delay();
  return {
    id: existingId ?? newId("unit"),
    name: values.name.trim(),
    code: values.code.trim() || "—",
  };
}

export async function createPod9Api(values: Pod9FormValues) {
  await delay();
  return {
    id: newId("pod9"),
    name: values.name.trim(),
    period: values.period.trim() || "—",
    status: values.status.trim() || "Черновик",
    responsible: values.responsible.trim(),
  };
}
