import type {
  Pod10ReportFormat,
  Pod10ReportParams,
} from "../model/pod10-params.ts";
import type { GeneratedReportFile } from "../../model/preview.types.ts";
import { apiFetch } from "../../../../shared/api/api-client.ts";
import {
  filenameFromContentDisposition,
  pod9FallbackFileName,
} from "../../lib/filename-from-content-disposition.ts";

const XLSX_MEDIA =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PDF_MEDIA = "application/pdf";

function expectedMedia(format: Pod10ReportFormat): string {
  return format === "pdf" ? PDF_MEDIA : XLSX_MEDIA;
}

/** GET /api/v1/reports/pod-10 — xlsx download or PDF preview/download. */
export async function fetchPod10Report(
  params: Pod10ReportParams,
  signal?: AbortSignal,
): Promise<GeneratedReportFile> {
  const format = params.format ?? "xlsx";

  const searchParams = new URLSearchParams({
    region_id: params.region_id,
    start_date: params.start_date,
    end_date: params.end_date,
    format,
    ...(params.district_id != null && { district_id: params.district_id }),
    ...(params.entry_date && { entry_date: params.entry_date }),
  });

  const response = await apiFetch(
    `/api/v1/reports/pod-10?${searchParams.toString()}`,
    { signal, tenantScoped: true },
  );

  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes(expectedMedia(format))) {
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
      pod9FallbackFileName(params.start_date, params.end_date, format),
    ),
  };
}
