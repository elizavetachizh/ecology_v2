import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { formatDate } from "../../../../shared/lib/format-date";
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FormField,
  FormSection,
  Input,
  PageContextBar,
} from "../../../../shared/ui";
import { fetchPod10Report } from "../api/fetchPod10Report.ts";
import { downloadBlob } from "../../../../shared/lib/download-blob.ts";
import {
  pod10FormDefaultValues,
  pod10FormSchema,
  type Pod10FormValues,
} from "../model/pod10-form.schema.ts";

import type { GeneratedReportFile } from "../../model/preview.types.ts";
import { RegionClassifierSelect } from "../../../waste/select-region-classifier";
import { pod10ReportErrorMessage } from "../model/pod10-report-error.ts";
import { DistrictClassifierSelect } from "../../../waste/select-district-classifier";
import { PdfPreviewPanel } from "../../ui/PdfPreviewPanel.tsx";

type ReportAction = "preview" | "download-xlsx" | "download-pdf";

export function Pod10ReportForm() {
  const form = useForm<Pod10FormValues>({
    resolver: zodResolver(pod10FormSchema),
    defaultValues: pod10FormDefaultValues,
  });
  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const regionId = useWatch<Pod10FormValues, "region_id">({
    control,
    name: "region_id",
  });

  const districtId = useWatch<Pod10FormValues, "district_id">({
    control,
    name: "district_id",
  });

  const startDate = useWatch<Pod10FormValues, "start_date">({
    control,
    name: "start_date",
  });
  const endDate = useWatch<Pod10FormValues, "end_date">({
    control,
    name: "end_date",
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<GeneratedReportFile | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [action, setAction] = useState<ReportAction | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const isPreviewLoading = action === "preview";
  const isDownloadXlsxLoading = action === "download-xlsx";
  const pending = action !== null;

  const abortPending = () => {
    requestRef.current?.abort();
    requestRef.current = null;
  };

  const runPreview = async (values: Pod10FormValues) => {
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
        await fetchPod10Report({ ...values, format: "pdf" }, controller.signal),
      );
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setPreviewError(pod10ReportErrorMessage(requestError));
    } finally {
      if (!controller.signal.aborted) setAction(null);
    }
  };

  const runDownloadXlsx = async (values: Pod10FormValues) => {
    abortPending();
    const controller = new AbortController();
    requestRef.current = controller;

    setDownloadError(null);
    setAction("download-xlsx");

    try {
      const file = await fetchPod10Report(
        { ...values, format: "xlsx" },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      downloadBlob(file.blob, file.fileName);
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setDownloadError(pod10ReportErrorMessage(requestError));
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
        title="ПОД-10"
        description="Журнал учёта движения отходов: место учёта, инструкция и период."
      />

      <FormSection
        title="Параметры отчёта"
        description="Выберите место учёта ПОД-9 и инструкцию, по которой ведётся журнал. Период ограничивает операции в таблицах листов."
      >
        <>
          <FormField
            htmlFor="region_id"
            label="Регион"
            error={errors.region_id?.message}
            description="Выберите регион, чтобы открыть список районов. При выборе родителя подставляется автоматически; можно изменить вручную."
          >
            <Controller
              name="region_id"
              control={control}
              render={({ field }) => (
                <RegionClassifierSelect
                  value={field.value != null ? String(field.value) : ""}
                  selectedLabel={regionId?.toString()}
                  onChange={(item) => {
                    console.log(item);
                    field.onChange(item?.id);
                    setValue("district_id", undefined, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              )}
            />
          </FormField>

          <Field>
            <FieldLabel htmlFor="district_id">Район</FieldLabel>
            {regionId != null ? (
              <Controller
                name="district_id"
                control={control}
                render={({ field }) => (
                  <DistrictClassifierSelect
                    region_id={regionId}
                    value={field.value != null ? String(field.value) : ""}
                    selectedLabel={districtId?.toString() ?? ""}
                    onChange={(item) => {
                      field.onChange(item?.id);
                    }}
                  />
                )}
              />
            ) : (
              <div className="flex h-9 items-center rounded-md border border-dashed border-border px-3 text-sm text-muted-foreground">
                Сначала выберите регион
              </div>
            )}
            <FieldDescription>
              Район зависит от выбранного региона и сбрасывается при его смене.
            </FieldDescription>
            <FieldError>{errors.district_id?.message}</FieldError>
          </Field>
        </>

        <FormField
          htmlFor="start_date"
          label="Начало периода отчёта"
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
          label="Конец периода отчёта"
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

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            void handleSubmit(runPreview, (errors) =>
              console.log("Ошибки валидации формы:", errors),
            )()
          }
        >
          <FileText />
          Сформировать
        </Button>
      </div>

      <PdfPreviewPanel
        open={previewOpen}
        onOpenChange={handlePreviewOpenChange}
        periodLabel={`${formatDate(startDate)} — ${formatDate(endDate)}`}
        preview={preview}
        error={previewError}
        downloadError={downloadError}
        isLoading={isPreviewLoading}
        isDownloading={isDownloadXlsxLoading}
        onRetry={() => void handleSubmit(runPreview)()}
        onDownloadExcel={() => void handleSubmit(runDownloadXlsx)()}
        onDownloadPdf={() => {
          if (!preview) return;
          downloadBlob(preview.blob, preview.fileName);
        }}
        title={"ПОД-10"}
      />
    </form>
  );
}
