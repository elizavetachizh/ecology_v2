import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchPod9Report } from "../../../entities/reports";
import { useTenant } from "../../../entities/tenant";
import { useUnitsTreeQuery } from "../../../entities/waste/units";
import { REPORTS } from "../../../shared/config/reports";
import { formatDate } from "../../../shared/lib/format-date";
import {
  pod9FormDefaultValues,
  pod9FormSchema,
  type Pod9FormValues,
} from "../model/pod9-form.schema";
import { pod9ReportErrorMessage } from "../model/pod9-report-error";
import { useGenerateReport } from "../../../shared/hooks";
import { Pod9UnitField } from "./Pod9UnitField";
import { ReportGenerateForm } from "./ReportGenerateForm";
import { ReportPeriodFields } from "./ReportPeriodFields";

type Pod9ReportFormProps = {
  showPageHeader?: boolean;
};

export function Pod9ReportForm({ showPageHeader = true }: Pod9ReportFormProps) {
  const { activeTenantId } = useTenant();
  const form = useForm<Pod9FormValues>({
    resolver: zodResolver(pod9FormSchema),
    defaultValues: pod9FormDefaultValues,
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const startDate = useWatch<Pod9FormValues, "start_date">({
    control,
    name: "start_date",
  });
  const endDate = useWatch<Pod9FormValues, "end_date">({
    control,
    name: "end_date",
  });

  const units = useUnitsTreeQuery({
    tenantId: activeTenantId,
    params: { sort: "name", order: "asc" },
  });

  const generate = useGenerateReport<Pod9FormValues>({
    fetchFile: (values, format, signal) =>
      fetchPod9Report({ ...values, format }, signal),
    mapError: pod9ReportErrorMessage,
  });

  return (
    <ReportGenerateForm
      report={REPORTS.pod9}
      showPageHeader={showPageHeader}
      pending={generate.pending}
      downloadError={generate.downloadError}
      onGenerate={() => void handleSubmit(generate.runPreview)()}
      preview={{
        open: generate.previewOpen,
        onOpenChange: generate.handlePreviewOpenChange,
        periodLabel: `${formatDate(startDate)} — ${formatDate(endDate)}`,
        file: generate.preview,
        previewKey: generate.previewKey,
        error: generate.previewError,
        isLoading: generate.isPreviewLoading,
        isDownloading: generate.isDownloading,
        onRetry: () => void handleSubmit(generate.runPreview)(),
        onDownloadExcel: () => void handleSubmit(generate.runDownloadXlsx)(),
        onDownloadPdf: generate.downloadPreviewPdf,
      }}
    >
      <Controller
        name="unit_id"
        control={control}
        render={({ field }) => (
          <Pod9UnitField
            tree={units.tree}
            loading={units.loading}
            error={units.error}
            value={field.value}
            onChange={field.onChange}
            disabled={generate.pending}
            errorMessage={errors.unit_id?.message}
          />
        )}
      />

      <ReportPeriodFields
        start={{
          register: register("start_date"),
          error: errors.start_date?.message,
        }}
        end={{
          register: register("end_date"),
          error: errors.end_date?.message,
        }}
        disabled={generate.pending}
      />
    </ReportGenerateForm>
  );
}
