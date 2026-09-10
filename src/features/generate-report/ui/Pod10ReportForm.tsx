import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchPod10Report } from "../../../entities/reports";
import { REPORTS } from "../../../shared/config/reports";
import { formatDate } from "../../../shared/lib/format-date";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FormField,
  Input,
} from "../../../shared/ui";
import { DistrictClassifierSelect } from "../../waste/select-district-classifier";
import { RegionClassifierSelect } from "../../waste/select-region-classifier";
import {
  pod10FormDefaultValues,
  pod10FormSchema,
  type Pod10FormValues,
} from "../model/pod10-form.schema";
import { pod10ReportErrorMessage } from "../model/pod10-report-error";
import { useGenerateReport } from "../model/use-generate-report";
import { ReportGenerateForm } from "./ReportGenerateForm";
import { ReportPeriodFields } from "./ReportPeriodFields";

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

  const [regionLabel, setRegionLabel] = useState("");
  const [districtLabel, setDistrictLabel] = useState("");

  const regionId = useWatch<Pod10FormValues, "region_id">({
    control,
    name: "region_id",
  });
  const startDate = useWatch<Pod10FormValues, "start_date">({
    control,
    name: "start_date",
  });
  const endDate = useWatch<Pod10FormValues, "end_date">({
    control,
    name: "end_date",
  });

  const generate = useGenerateReport<Pod10FormValues>({
    fetchFile: (values, format, signal) =>
      fetchPod10Report({ ...values, format }, signal),
    mapError: pod10ReportErrorMessage,
  });

  return (
    <ReportGenerateForm
      report={REPORTS.pod10}
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
    >
      <FormField
        htmlFor="region_id"
        label="Регион"
        error={errors.region_id?.message}
        description="Необязательно. Без региона и района отчёт строится по всем подразделениям организации."
      >
        <Controller
          name="region_id"
          control={control}
          render={({ field }) => (
            <RegionClassifierSelect
              value={field.value != null ? String(field.value) : ""}
              selectedLabel={regionLabel || undefined}
              onChange={(item) => {
                field.onChange(item?.id);
                setRegionLabel(item?.name ?? "");
                setValue("district_id", undefined, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setDistrictLabel("");
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
                selectedLabel={districtLabel || undefined}
                onChange={(item) => {
                  field.onChange(item?.id);
                  setDistrictLabel(item?.name ?? "");
                }}
              />
            )}
          />
        ) : (
          <div className="flex h-9 items-center rounded-md border border-dashed border-border px-3 text-sm text-muted-foreground">
            Сначала выберите регион — или оставьте пустым для всей организации
          </div>
        )}
        <FieldDescription>
          Необязательно. Зависит от региона и сбрасывается при его смене.
        </FieldDescription>
        <FieldError>{errors.district_id?.message}</FieldError>
      </Field>

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

      <FormField
        htmlFor="entry_date"
        label="Дата внесения"
        error={errors.entry_date?.message}
        description="Необязательно. Попадает в строки таблицы, на выборку операций не влияет."
      >
        <Input
          id="entry_date"
          type="date"
          disabled={generate.pending}
          aria-invalid={Boolean(errors.entry_date)}
          {...register("entry_date")}
        />
      </FormField>
    </ReportGenerateForm>
  );
}
