import { routes } from "./routes";

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

    to: routes.directories.instructions.list,
  },
  {
    id: "units",
    title: "Структура организации",
    description: "Вложенные структурные единицы и журналы ПОД-9 в одном дереве",
    to: routes.directories.units.list,
  },
  {
    id: "wastes",
    title: "Отходы",
    description:
      "Справочник отходов: сначала карточка, затем привязки к единицам и ПОД-9",
    to: routes.directories.wastes.list,
  },
  {
    id: "waste-sources",
    title: "Источники образования",
    description: "Источники образования отходов предприятия",
    to: routes.directories.wasteSources.list,
  },

  {
    id: "permits",
    title: "Разрешения на хранение и захоронение отходов",
    description:
      "Разрешения на захоронение отходов: номер, подразделение, сроки, лимиты",
    to: routes.directories.permits.list,
  },
  {
    id: "standards",
    title: "Нормативы образования отходов",
    description:
      "Нормативы образования отходов: подразделение, дата начала, перечень отходов",
    to: routes.directories.standards.list,
  },
  {
    id: "orders",
    title: "Приказы",
    description:
      "Приказы по подразделениям или на всё предприятие: номер и дата начала действия. Документ бессрочный.",
    to: routes.directories.orders.list,
  },
  {
    id: "persons",
    title: "Ответственные",
    description: "Ответственные за экологическое мониторинг",
    to: routes.directories.persons.list,
  },
];

export const EXPORT_CARDS: DirectoryCard[] = [
  {
    id: "vehicles",
    title: "Транспортные средства",
    description: "Транспорт организации для перевозки отходов",
    to: routes.directories.vehicles.list,
  },
  {
    id: "counterparties",
    title: "Контрагенты",
    description: "Юрлица и физлица организации: УНП, адрес, активность",
    to: routes.directories.counterparties.list,
  },
  {
    id: "contracts",
    title: "Договоры",
    description:
      "Договоры утилизации и перевозки: контрагент, сроки, перечень отходов",
    to: routes.directories.contracts.list,
  },
  {
    id: "passports",
    title: "Сопроводительные паспорта",
    description: "Сопроводительные паспорта для вывоза отходов",
    to: routes.passports.list,
  },
  {
    id: "ttns",
    title: "ТТН",
    description: "Транспортные накладные для вывоза отходов",
    to: routes.ttns.list,
  },
];
