import { routes } from "./routes";

export type ReportId = "pod9" | "pod10";

export type ReportDefinition = {
  id: ReportId;
  slug: "pod-9" | "pod-10";
  title: string;
  to: string;
  pageDescription: string;
  formDescription: string;
  tenantGateDescription: string;
};

export const REPORTS: Record<ReportId, ReportDefinition> = {
  pod9: {
    id: "pod9",
    slug: "pod-9",
    title: "ПОД-9",
    to: routes.reports.pod9,
    pageDescription:
      "Журнал учёта движения отходов: место учёта, инструкция и период. Отходы берутся из привязок, в строки — подтверждённые операции.",
    formDescription:
      "Выберите место учёта ПОД-9 и инструкцию, по которой ведётся журнал. Период ограничивает операции в таблицах листов.",
    tenantGateDescription:
      "Формирование отчёта ПОД-9 доступно после выбора организации в верхней панели.",
  },
  pod10: {
    id: "pod10",
    slug: "pod-10",
    title: "ПОД-10",
    to: routes.reports.pod10,
    pageDescription:
      "Сводка по отходам организации за период. Без региона и района — все подразделения. Дата внесения попадает в строки таблицы, если указана.",
    formDescription:
      "Регион и район необязательны и фильтруют подразделения. Период обязателен. Дата внесения — только в таблицу, на выборку не влияет.",
    tenantGateDescription:
      "Формирование отчёта ПОД-10 доступно после выбора организации в верхней панели.",
  },
};

export const REPORT_NAV_ITEMS = (
  Object.values(REPORTS) as ReportDefinition[]
).map((report) => ({
  id: report.slug,
  title: report.title,
  to: report.to,
}));
