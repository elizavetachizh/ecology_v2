import { apiFetch } from "../../../shared/api/api-client";
import { filenameFromContentDisposition } from "../lib/filename-from-content-disposition";
import type { GeneratedReportFile, ReportFormat } from "../model/reports.types";

const XLSX_MEDIA =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PDF_MEDIA = "application/pdf";

function expectedMedia(format: ReportFormat): string {
  return format === "pdf" ? PDF_MEDIA : XLSX_MEDIA;
}

export function appendReportQuery(
  searchParams: URLSearchParams,
  query: Record<string, string | number | null | undefined>,
) {
  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === "") continue;
    searchParams.set(key, String(value));
  }
}

export async function fetchReportFile(options: {
  path: string;
  query: Record<string, string | number | null | undefined>;
  format: ReportFormat;
  fallbackFileName: string;
  signal?: AbortSignal;
}): Promise<GeneratedReportFile> {
  const searchParams = new URLSearchParams();
  appendReportQuery(searchParams, { ...options.query, format: options.format });

  const response = await apiFetch(
    `${options.path}?${searchParams.toString()}`,
    {
      signal: options.signal,
      tenantScoped: true,
    },
  );

  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes(expectedMedia(options.format))) {
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
      options.fallbackFileName,
    ),
  };
}
