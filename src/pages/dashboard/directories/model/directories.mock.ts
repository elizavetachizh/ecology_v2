export type DirectoryCard = {
  id: string;
  title: string;
  description: string;
  count: number;
  fillStatus: "empty" | "partial" | "ready";
  to: string;
};

export const DIRECTORY_CARDS: DirectoryCard[] = [
  {
    id: "instructions",
    title: "Инструкции",
    description: "Инструкции по экологическому мониторингу",
    count: 0,
    fillStatus: "empty",
    to: "/directories/instructions",
  },
  {
    id: "structure",
    title: "Структура организации",
    description: "Вложенные структурные единицы и журналы ПОД-9 в одном дереве",
    count: 3,
    fillStatus: "ready",
    to: "/directories/structure",
  },
  {
    id: "departments",
    title: "Подразделения",
    description: "Список подразделений организации",
    count: 3,
    fillStatus: "ready",
    to: "/directories/departments",
  },
  {
    id: "wastes",
    title: "Отходы",
    description:
      "Справочник отходов: сначала карточка, затем привязки к единицам и ПОД-9",
    count: 3,
    fillStatus: "partial",
    to: "/directories/wastes",
  },
  {
    id: "limits",
    title: "Лимиты накопления",
    description: "Лимиты по местам хранения",
    count: 0,
    fillStatus: "empty",
    to: "/directories/limits",
  },
  {
    id: "norms",
    title: "Нормативы",
    description: "Нормативы образования отходов",
    count: 0,
    fillStatus: "empty",
    to: "/directories/norms",
  },
];

export const FILL_STATUS_LABEL: Record<DirectoryCard["fillStatus"], string> = {
  empty: "Не заполнен",
  partial: "Частично",
  ready: "Готов",
};
