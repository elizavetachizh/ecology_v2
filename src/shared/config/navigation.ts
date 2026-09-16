import {
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Library,
  Trash2,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { DIRECTORY_CARDS } from "./directories";
import { REPORT_NAV_ITEMS } from "./reports";
import { routes } from "./routes";

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
    id: "home",
    title: "Главная",
    icon: LayoutDashboard,
    to: routes.home,
  },
  {
    id: "directories",
    title: "Справочники",
    icon: Library,
    children: [
      {
        id: "directories-hub",
        title: "Все справочники",
        to: routes.directories.index,
      },
      ...DIRECTORY_CARDS,
    ],
  },
  {
    id: "operations",
    title: "Журнал операций",
    icon: ClipboardList,
    to: routes.waste.operations.list,
  },
  {
    id: "passports",
    title: "Сопроводительные паспорта",
    icon: FileText,
    to: routes.waste.passports.list,
  },
  {
    id: "ttns",
    title: "ТТН",
    icon: Truck,
    to: routes.waste.ttns.list,
  },
  {
    id: "balances",
    title: "Остатки отходов",
    icon: Trash2,
    to: routes.waste.balances,
  },
  {
    id: "reports",
    title: "Отчеты",
    icon: BookOpen,
    children: REPORT_NAV_ITEMS,
  },
];
