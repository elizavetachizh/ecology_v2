import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Eye, FileText, LoaderCircle } from "lucide-react";
import { useTenant } from "../../../entities/tenant";
import { useUnitsTreeQuery } from "../../../entities/waste/units";
import {
  DEFAULT_UIW_LIST_LIMIT,
  DEFAULT_UNIT_INSTRUCTIONS_LIMIT,
  useUnitInstructionWastesListQuery,
  useUnitInstructionsListQuery,
} from "../../../entities/waste/unit-instruction-waste";
import { formatDate } from "../../../shared/lib/format-date";
import {
  Alert,
  AlertDescription,
  Button,
  FormField,
  FormSection,
  Input,
  PageContextBar,
} from "../../../shared/ui";
import { fetchPod9Report } from "../api/fetchPod9Report";
import { downloadBlob } from "../lib/download-blob";
import {
  pod9FormDefaultValues,
  pod9FormSchema,
  type Pod9FormValues,
} from "../model/pod9-form.schema";
import { pod9ReportErrorMessage } from "../model/pod9-report-error";
import type { GeneratedReportFile } from "../model/preview.types";
import { resolveReportInstructionId } from "../model/resolve-instruction-id";
import { PdfPreviewPanel } from "./PdfPreviewPanel";
import { Pod9InstructionField } from "./Pod9InstructionField";
import { Pod9UnitField } from "./Pod9UnitField";
import { Pod9WastesHint } from "./Pod9WastesHint";

type ReportAction = "preview" | "download-xlsx" | "download-pdf";

export function Pod9ReportForm() {
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

  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<GeneratedReportFile | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [action, setAction] = useState<ReportAction | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const isPreviewLoading = action === "preview";
  const isDownloadXlsxLoading = action === "download-xlsx";
  const isDownloadPdfLoading = action === "download-pdf";
  const pending = action !== null;

  const abortPending = () => {
    requestRef.current?.abort();
    requestRef.current = null;
  };

  const runPreview = async (values: Pod9FormValues) => {
    abortPending();
    const controller = new AbortController();
    requestRef.current = controller;

    setPreviewOpen(true);
    setPreview(null);
    setPreviewError(null);
    setDownloadError(null);
    setAction("preview");

    try {
      setPreview(
        await fetchPod9Report({ ...values, format: "pdf" }, controller.signal),
      );
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setPreviewError(pod9ReportErrorMessage(requestError));
    } finally {
      if (!controller.signal.aborted) setAction(null);
    }
  };

  const runDownloadXlsx = async (values: Pod9FormValues) => {
    abortPending();
    const controller = new AbortController();
    requestRef.current = controller;

    setDownloadError(null);
    setAction("download-xlsx");

    try {
      const file = await fetchPod9Report(
        { ...values, format: "xlsx" },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      downloadBlob(file.blob, file.fileName);
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setDownloadError(pod9ReportErrorMessage(requestError));
    } finally {
      if (!controller.signal.aborted) setAction(null);
    }
  };

  const runDownloadPdf = async (values: Pod9FormValues) => {
    if (preview) {
      downloadBlob(preview.blob, preview.fileName);
      return;
    }

    abortPending();
    const controller = new AbortController();
    requestRef.current = controller;

    setDownloadError(null);
    setAction("download-pdf");

    try {
      const file = await fetchPod9Report(
        { ...values, format: "pdf" },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      downloadBlob(file.blob, file.fileName);
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setDownloadError(pod9ReportErrorMessage(requestError));
    } finally {
      if (!controller.signal.aborted) setAction(null);
    }
  };

  const handlePreviewOpenChange = (nextOpen: boolean) => {
    setPreviewOpen(nextOpen);
    if (!nextOpen && isPreviewLoading) {
      abortPending();
      setAction(null);
    }
  };

  return (
    <form className="mx-auto max-w-4xl space-y-6">
      <PageContextBar
        eyebrow="Отчёты"
        title="ПОД-9"
        description="Журнал учёта движения отходов: место учёта, инструкция и период. Отходы берутся из привязок, в строки — подтверждённые операции."
      />

      <FormSection
        title="Параметры отчёта"
        description="Выберите место учёта ПОД-9 и инструкцию, по которой ведётся журнал. Период ограничивает операции в таблицах листов."
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
              disabled={pending}
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
              disabled={pending}
              errorMessage={errors.instruction_id?.message}
            />
          )}
        />

        <FormField
          htmlFor="start_date"
          label="Начало периода"
          required
          error={errors.start_date?.message}
        >
          <Input
            id="start_date"
            type="date"
            disabled={pending}
            aria-invalid={Boolean(errors.start_date)}
            {...register("start_date")}
          />
        </FormField>

        <FormField
          htmlFor="end_date"
          label="Конец периода"
          required
          error={errors.end_date?.message}
        >
          <Input
            id="end_date"
            type="date"
            disabled={pending}
            aria-invalid={Boolean(errors.end_date)}
            {...register("end_date")}
          />
        </FormField>
      </FormSection>

      <Pod9WastesHint
        unitId={unitId}
        instructionId={instructionId}
        items={uiwQuery.items}
        total={uiwQuery.total}
        loading={uiwQuery.loading}
        error={uiwQuery.error}
      />

      {downloadError ? (
        <Alert variant="error">
          <AlertDescription>{downloadError}</AlertDescription>
        </Alert>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Предпросмотр — PDF; для работы в Excel скачайте xlsx.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => void handleSubmit(runPreview)()}
        >
          {isPreviewLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Eye />
          )}
          Предпросмотр
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => void handleSubmit(runDownloadXlsx)()}
        >
          {isDownloadXlsxLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Download />
          )}
          Скачать Excel
        </Button>
        <Button
          type="button"
          disabled={pending}
          onClick={() => void handleSubmit(runDownloadPdf)()}
        >
          {isDownloadPdfLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <FileText />
          )}
          Скачать PDF
        </Button>
      </div>

      <PdfPreviewPanel
        open={previewOpen}
        onOpenChange={handlePreviewOpenChange}
        periodLabel={`${formatDate(startDate)} — ${formatDate(endDate)}`}
        preview={preview}
        error={previewError}
        isLoading={isPreviewLoading}
        isDownloading={isDownloadXlsxLoading}
        onRetry={() => void handleSubmit(runPreview)()}
        onDownloadExcel={() => void handleSubmit(runDownloadXlsx)()}
        onDownloadPdf={() => {
          if (!preview) return;
          downloadBlob(preview.blob, preview.fileName);
        }}
      />
    </form>
  );
}
