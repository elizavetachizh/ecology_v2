import { CalendarRange, FileSpreadsheet } from "lucide-react";
import { Pod9ReportPreviewButton } from "../../../features/generate-report";
import { PageContextBar } from "../../../shared/ui";

const TEST_PREVIEW_PARAMS = {
  company: "5000000000000000",
  department: "321",
  wastes: "448,449",
  startDate: "2026-01-01",
  endDate: "2026-03-01",
} as const;

export function Pod9ReportPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageContextBar
        eyebrow="Отчёты"
        title="ПОД-9"
        description="Журнал учёта движения отходов за выбранный период."
        actions={<Pod9ReportPreviewButton params={TEST_PREVIEW_PARAMS} />}
      />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarRange className="size-4" />
            Период отчёта
          </div>
          <div className="text-lg font-semibold text-foreground">
            01.01.2026 — 01.03.2026
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Тестовый период для разработки предпросмотра.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileSpreadsheet className="size-4" />
            Параметры выборки
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Подразделение</dt>
            <dd className="font-medium text-foreground">321</dd>
            <dt className="text-muted-foreground">Коды отходов</dt>
            <dd className="font-medium text-foreground">448, 449</dd>
          </dl>
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
        <h2 className="font-semibold text-foreground">Предпросмотр отчёта</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Нажмите «Предпросмотр», чтобы сформировать Excel на сервере и
          проверить его листы перед скачиванием.
        </p>
      </section>
    </div>
  );
}
