import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchPod9Report } from "../../../entities/reports";
import { useTenant } from "../../../entities/tenant";
import { useUnitsTreeQuery } from "../../../entities/waste/units";
import {
  DEFAULT_UIW_LIST_LIMIT,
  DEFAULT_UNIT_INSTRUCTIONS_LIMIT,
  useUnitInstructionWastesListQuery,
  useUnitInstructionsListQuery,
} from "../../../entities/waste/unit-instruction-waste";
import { REPORTS } from "../../../shared/config/reports";
import { formatDate } from "../../../shared/lib/format-date";
import {
  pod9FormDefaultValues,
  pod9FormSchema,
  type Pod9FormValues,
} from "../model/pod9-form.schema";
import { pod9ReportErrorMessage } from "../model/pod9-report-error";
import { resolveReportInstructionId } from "../model/resolve-instruction-id";
import { useGenerateReport } from "../model/use-generate-report";
import { Pod9InstructionField } from "./Pod9InstructionField";
import { Pod9UnitField } from "./Pod9UnitField";
import { Pod9WastesHint } from "./Pod9WastesHint";
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
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const unitId = useWatch<Pod9FormValues, "unit_id">({
    control,
    name: "unit_id",
  });
  const instructionId = useWatch<Pod9FormValues, "instruction_id">({
    control,
    name: "instruction_id",
  });
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

  const instructionsQuery = useUnitInstructionsListQuery({
    tenantId: activeTenantId,
    unitId,
    params: {
      limit: DEFAULT_UNIT_INSTRUCTIONS_LIMIT,
      offset: 0,
      sort: "name",
      order: "asc",
    },
    enabled: Boolean(unitId),
  });

  const uiwQuery = useUnitInstructionWastesListQuery({
    tenantId: activeTenantId,
    scope: { unitId, instructionId },
    params: { limit: DEFAULT_UIW_LIST_LIMIT, offset: 0 },
    enabled: Boolean(unitId && instructionId),
  });

  const instructionListKey = instructionsQuery.items
    .map((item) => `${item.id}:${item.status}`)
    .join("|");

  useEffect(() => {
    if (!unitId) return;
    const next = resolveReportInstructionId(
      instructionId,
      instructionsQuery.items,
      instructionsQuery.loading,
    );
    if (next !== instructionId) {
      setValue("instruction_id", next);
    }
  }, [
    unitId,
    instructionId,
    instructionListKey,
    instructionsQuery.items,
    instructionsQuery.loading,
    setValue,
  ]);

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
        error: generate.previewError,
        isLoading: generate.isPreviewLoading,
        isDownloading: generate.isDownloading,
        onRetry: () => void handleSubmit(generate.runPreview)(),
        onDownloadExcel: () => void handleSubmit(generate.runDownloadXlsx)(),
        onDownloadPdf: generate.downloadPreviewPdf,
      }}
      afterSection={
        <Pod9WastesHint
          unitId={unitId}
          instructionId={instructionId}
          items={uiwQuery.items}
          total={uiwQuery.total}
          loading={uiwQuery.loading}
          error={uiwQuery.error}
        />
      }
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
            onChange={(next) => {
              if (next !== field.value) {
                setValue("instruction_id", "");
              }
              field.onChange(next);
            }}
            disabled={generate.pending}
            errorMessage={errors.unit_id?.message}
          />
        )}
      />

      <Controller
        name="instruction_id"
        control={control}
        render={({ field }) => (
          <Pod9InstructionField
            unitId={unitId}
            instructions={instructionsQuery.items}
            loading={instructionsQuery.loading}
            error={instructionsQuery.error}
            value={field.value}
            onChange={field.onChange}
            disabled={generate.pending}
            errorMessage={errors.instruction_id?.message}
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
