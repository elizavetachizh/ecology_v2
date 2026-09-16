import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchStatReport,
  STAT_REPORT_YEAR_MAX,
  STAT_REPORT_YEAR_MIN,
} from "../../../entities/reports";
import { REPORTS } from "../../../shared/config/reports";
import { FormField, Input } from "../../../shared/ui";
import {
  statFormDefaultValues,
  statFormSchema,
  type StatFormValues,
} from "../model/stat-form.schema";
import { statReportErrorMessage } from "../model/stat-report-error";
import { useGenerateReport } from "../model/use-generate-report";
import { ReportGenerateForm } from "./ReportGenerateForm";

export function StatReportForm() {
  const form = useForm<StatFormValues>({
    resolver: zodResolver(statFormSchema),
    defaultValues: statFormDefaultValues,
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const year = useWatch<StatFormValues, "year">({
    control,
    name: "year",
  });

  const generate = useGenerateReport<StatFormValues>({
    fetchFile: (values, format, signal) =>
      fetchStatReport({ ...values, format }, signal),
    mapError: statReportErrorMessage,
  });

  return (
    <ReportGenerateForm
      report={REPORTS.stat1Waste}
      pending={generate.pending}
      downloadError={generate.downloadError}
      onGenerate={() => void handleSubmit(generate.runPreview)()}
      preview={{
        open: generate.previewOpen,
        onOpenChange: generate.handlePreviewOpenChange,
        periodLabel: Number.isInteger(year) ? `${year} год` : "—",
        file: generate.preview,
        error: generate.previewError,
        isLoading: generate.isPreviewLoading,
        isDownloading: generate.isDownloading,
        onRetry: () => void handleSubmit(generate.runPreview)(),
        onDownloadExcel: () => void handleSubmit(generate.runDownloadXlsx)(),
        onDownloadPdf: generate.downloadPreviewPdf,
      }}
    >
      <FormField
        htmlFor="year"
        label="Отчётный год"
        required
        error={errors.year?.message}
        description="Календарный год по всей организации. Регион и подразделение не выбираются."
      >
        <Input
          id="year"
          type="number"
          min={STAT_REPORT_YEAR_MIN}
          max={STAT_REPORT_YEAR_MAX}
          step={1}
          className="w-28"
          disabled={generate.pending}
          aria-invalid={Boolean(errors.year)}
          {...register("year", { valueAsNumber: true })}
        />
      </FormField>
    </ReportGenerateForm>
  );
}
