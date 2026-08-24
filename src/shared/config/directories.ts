export type DirectoryCard = {
  id: string;
  title: string;
  description: string;
  to: string;
};

export const DIRECTORY_CARDS: DirectoryCard[] = [
  {
    id: "instructions",
    title: "Инструкции",
    description: "Инструкции по экологическому мониторингу",

    to: "/directories/instructions",
  },
  {
    id: "units",
    title: "Структура организации",
    description: "Вложенные структурные единицы и журналы ПОД-9 в одном дереве",
    to: "/directories/units",
  },
  {
    id: "wastes",
    title: "Отходы",
    description:
      "Справочник отходов: сначала карточка, затем привязки к единицам и ПОД-9",
    to: "/directories/wastes",
  },
  {
    id: "waste-sources",
    title: "Источники образования",
    description: "Источники образования отходов предприятия",
    to: "/directories/waste-sources",
  },
  {
    id: "counterparties",
    title: "Контрагенты",
    description: "Юрлица и физлица организации: УНП, адрес, активность",
    to: "/directories/counterparties",
  },
  {
    id: "contracts",
    title: "Договоры",
    description:
      "Договоры утилизации и перевозки: контрагент, сроки, перечень отходов",
    to: "/directories/contracts",
  },
  {
    id: "limits",
    title: "Лимиты накопления",
    description: "Лимиты по местам хранения",
    to: "/directories/limits",
  },
  {
    id: "norms",
    title: "Нормативы",
    description: "Нормативы образования отходов",
    to: "/directories/norms",
  },
];
