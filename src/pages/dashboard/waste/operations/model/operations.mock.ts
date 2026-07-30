export type OperationStatus =
  | "posted"
  | "draft"
  | "needs_review"
  | "error";

export type OperationRow = {
  id: string;
  date: string;
  department: string;
  facility: string;
  waste: string;
  operationType: string;
  quantity: number;
  unit: string;
  storagePlace: string;
  document: string;
  status: OperationStatus;
};

export const OPERATION_STATUS_LABEL: Record<OperationStatus, string> = {
  posted: "Проведена",
  draft: "Черновик",
  needs_review: "Требует проверки",
  error: "Ошибка данных",
};

export const MOCK_OPERATIONS: OperationRow[] = [
  {
    id: "op-1",
    date: "2026-07-28",
    department: "Цех №1",
    facility: "Производственный корпус А",
    waste: "Отходы бумаги и картона",
    operationType: "Образовалось",
    quantity: 120,
    unit: "кг",
    storagePlace: "Контейнер №3",
    document: "Акт №45",
    status: "posted",
  },
  {
    id: "op-2",
    date: "2026-07-27",
    department: "Аппарат управления",
    facility: "Административное здание",
    waste: "Мусор от офисных помещений",
    operationType: "Образовалось",
    quantity: 35,
    unit: "кг",
    storagePlace: "Бункер АУ",
    document: "—",
    status: "draft",
  },
  {
    id: "op-3",
    date: "2026-07-26",
    department: "Складской комплекс",
    facility: "Склад временного хранения",
    waste: "Лампы ртутные, ртутно-кварцевые",
    operationType: "Вывоз отходов",
    quantity: 12,
    unit: "шт",
    storagePlace: "Шкаф ЛРО",
    document: "Накладная №12",
    status: "needs_review",
  },
  {
    id: "op-4",
    date: "2026-07-25",
    department: "Цех №1",
    facility: "Производственный корпус Б",
    waste: "Отработанные масла моторные",
    operationType: "Передано",
    quantity: 200,
    unit: "л",
    storagePlace: "Ёмкость М-1",
    document: "Договор №8",
    status: "error",
  },
  {
    id: "op-5",
    date: "2026-07-24",
    department: "Складской комплекс",
    facility: "Площадка накопления",
    waste: "Отходы бумаги и картона",
    operationType: "Поступило",
    quantity: 80,
    unit: "кг",
    storagePlace: "Площадка №2",
    document: "ТТН №901",
    status: "posted",
  },
];
