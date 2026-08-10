/**
 * Иерархия:
 * структурная единица (любая вложенность) → ПОД-9 как дочерние узлы в дереве.
 *
 * type "actions" — служебная строка «Добавить структурную единицу».
 */
export type StructureNodeType = "unit" | "pod9" | "actions";

export type StructureNode = {
  id: string;
  name: string;
  type: StructureNodeType;
  /** Доп. подпись в колонке «Тип» */
  typeLabel: string;
  code?: string;
  period?: string;
  status?: string;
  /** Ответственный (для ПОД-9) */
  responsible?: string;
  /** Для строки actions: id родителя */
  parentId?: string;
  children?: StructureNode[];
};

export const MOCK_STRUCTURE: StructureNode[] = [
  {
    id: "unit-1",
    name: "Аппарат управления",
    type: "unit",
    typeLabel: "Структурная единица",
    code: "АУ",
    children: [
      {
        id: "unit-1-1",
        name: "Административное здание",
        type: "unit",
        typeLabel: "Структурная единица",
        code: "АЗ-1",
        children: [
          {
            id: "pod9-1",
            name: "Журнал ПОД-9",
            type: "pod9",
            typeLabel: "ПОД-9",
            period: "Январь–март 2026",
            status: "Сформирован",
            responsible: "Иванов И.И.",
          },
          {
            id: "pod9-2",
            name: "Журнал ПОД-9",
            type: "pod9",
            typeLabel: "ПОД-9",
            period: "Апрель–июнь 2026",
            status: "Черновик",
            responsible: "Петрова А.С.",
          },
        ],
      },
      {
        id: "unit-1-2",
        name: "Гараж АУ",
        type: "unit",
        typeLabel: "Структурная единица",
        code: "Г-АУ",
        children: [
          {
            id: "pod9-3",
            name: "Журнал ПОД-9",
            type: "pod9",
            typeLabel: "ПОД-9",
            period: "2026",
            status: "Не сформирован",
            responsible: "Сидоров К.В.",
          },
        ],
      },
    ],
  },
  {
    id: "unit-2",
    name: "Цех №1",
    type: "unit",
    typeLabel: "Структурная единица",
    code: "Ц-1",
    children: [
      {
        id: "unit-2-1",
        name: "Производственный корпус А",
        type: "unit",
        typeLabel: "Структурная единица",
        code: "ПК-А",
        children: [
          {
            id: "pod9-4",
            name: "Журнал ПОД-9",
            type: "pod9",
            typeLabel: "ПОД-9",
            period: "Январь–июнь 2026",
            status: "Сформирован",
            responsible: "Козлова М.Н.",
          },
        ],
      },
      {
        id: "unit-2-2",
        name: "Производственный корпус Б",
        type: "unit",
        typeLabel: "Структурная единица",
        code: "ПК-Б",
        children: [
          {
            id: "pod9-5",
            name: "Журнал ПОД-9",
            type: "pod9",
            typeLabel: "ПОД-9",
            period: "2026",
            status: "Требует проверки",
            responsible: "Никитин Д.А.",
          },
        ],
      },
    ],
  },
  {
    id: "unit-3",
    name: "Складской комплекс",
    type: "unit",
    typeLabel: "Структурная единица",
    code: "СК",
    children: [
      {
        id: "unit-3-1",
        name: "Склад временного хранения",
        type: "unit",
        typeLabel: "Структурная единица",
        code: "СВХ",
        children: [
          {
            id: "pod9-6",
            name: "Журнал ПОД-9",
            type: "pod9",
            typeLabel: "ПОД-9",
            period: "I квартал 2026",
            status: "Сформирован",
            responsible: "Орлова Е.П.",
          },
        ],
      },
      {
        id: "unit-3-2",
        name: "Площадка накопления",
        type: "unit",
        typeLabel: "Структурная единица",
        code: "ПН-1",
        children: [],
      },
    ],
  },
];

