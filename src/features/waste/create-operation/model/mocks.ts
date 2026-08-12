export type OperationType = {
  id: string;
  name: string;
};

export type CreateOperationForm = {
  /** Структурная единица из MOCK_STRUCTURE / дерева структуры */
  unitId: string;
  wasteId: string;
  date: string;
  operationTypeId: string;
  quantity: string;
};

export const OPERATION_TYPES: OperationType[] = [
  { id: "formed", name: "Образовалось" },
  { id: "export", name: "Вывоз отходов" },
  { id: "transferred", name: "Передано" },
  { id: "received", name: "Поступило" },
];

export const CREATE_OPERATION_STEPS = [
  { id: 1, title: "Структурная единица" },
  { id: 2, title: "Отход" },
  { id: 3, title: "Данные операции" },
] as const;

export function createEmptyOperationForm(): CreateOperationForm {
  return {
    unitId: "",
    wasteId: "",
    date: new Date().toISOString().slice(0, 10),
    operationTypeId: "",
    quantity: "",
  };
}
