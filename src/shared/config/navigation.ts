import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Library,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { DIRECTORY_CARDS, EXPORT_CARDS } from "./directories";
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
    id: "export",
    title: "Вывоз отходов",
    icon: Truck,
    children: EXPORT_CARDS,
  },
  {
    id: "operations",
    title: "Журнал операций",
    icon: ClipboardList,
    to: routes.operations.list,
  },

  {
    id: "reports",
    title: "Отчеты",
    icon: BookOpen,
    children: REPORT_NAV_ITEMS,
  },
];
