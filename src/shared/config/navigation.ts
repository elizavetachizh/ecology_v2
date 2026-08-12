import {
  BookOpen,
  ClipboardList,
  Library,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { DIRECTORY_CARDS } from "./directories";

export type NavLeaf = {
  id: string;
  title: string;
  to: string;
};

export type NavGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Прямой путь, если нет children */
  to?: string;
  children?: NavLeaf[];
};

export const navigationGroups: NavGroup[] = [
  {
    id: "directories",
    title: "Справочники",
    icon: Library,
    children: [
      {
        id: "directories-hub",
        title: "Все справочники",
        to: "/directories",
      },
      ...DIRECTORY_CARDS,
    ],
  },
  {
    id: "operations",
    title: "Журнал операций",
    icon: ClipboardList,
    to: "/waste/operations",
  },
  {
    id: "balances",
    title: "Остатки отходов",
    icon: Trash2,
    to: "/waste/balances",
  },
  {
    id: "reports",
    title: "Отчеты",
    icon: BookOpen,
    children: [
      { id: "pod-9", title: "ПОД-9", to: "/reports/pod-9" },
      { id: "pod-10", title: "ПОД-10", to: "/reports/pod-10" },
      {
        id: "stat-1-waste",
        title: "Статистика 1-отходы",
        to: "/reports/1-waste",
      },
    ],
  },
];
