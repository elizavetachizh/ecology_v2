import { apiFetch } from "../../../shared/api/api-client";
import {
  filenameFromContentDisposition,
  pod9FallbackFileName,
} from "../lib/filename-from-content-disposition";
import type { GeneratedReportFile } from "../model/preview.types";
import type { Pod9ReportParams } from "../model/pod9-params";

const XLSX_MEDIA =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function generatePod9Report(
  params: Pod9ReportParams,
  signal?: AbortSignal,
): Promise<GeneratedReportFile> {
  const searchParams = new URLSearchParams({
    unit_id: params.unit_id,
    instruction_id: params.instruction_id,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  const response = await apiFetch(
    `/api/v1/reports/pod-9?${searchParams.toString()}`,
    { signal, tenantScoped: true },
  );

  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes(XLSX_MEDIA)) {
    throw new Error("Сервер вернул ответ в неподдерживаемом формате");
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error("Сервер вернул пустой файл");
  }

  return {
    blob,
    contentType,
    fileName: filenameFromContentDisposition(
      response.headers.get("Content-Disposition"),
      pod9FallbackFileName(params.start_date, params.end_date),
    ),
  };
}
