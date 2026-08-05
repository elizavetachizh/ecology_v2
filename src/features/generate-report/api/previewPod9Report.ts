import { parseExcelPreview } from "../lib/parseExcelPreview";
import { apiFetch } from "../../../shared/api/api-client";
import type {
  Pod9ReportPreviewParams,
  ReportPreview,
} from "../model/preview.types";

function getFileName(contentDisposition: string | null): string {
  if (!contentDisposition) return "POD-9.xlsx";

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/^["']|["']$/g, ""));
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return fileNameMatch?.[1]?.trim() || "POD-9.xlsx";
}

export async function previewPod9Report(
  params: Pod9ReportPreviewParams,
  signal?: AbortSignal,
): Promise<ReportPreview> {
  const searchParams = new URLSearchParams({
    company: params.company,
    department: params.department,
    wastes: params.wastes,
    start_date: params.startDate,
    end_date: params.endDate,
  });
  const response = await apiFetch(
    `/api/w/pod-9/?${searchParams.toString()}`,
    { signal, tenantScoped: true },
  );

  const contentType = response.headers.get("Content-Type") || "";
  if (
    !contentType.includes("application/vnd.ms-excel") &&
    !contentType.includes(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
  ) {
    throw new Error("Сервер вернул ответ в неподдерживаемом формате");
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error("Сервер вернул пустой файл");
  }

  const sheets = await parseExcelPreview(blob);
  if (sheets.length === 0) {
    throw new Error("В файле нет листов для предпросмотра");
  }

  return {
    blob,
    sheets,
    contentType,
    fileName: getFileName(response.headers.get("Content-Disposition")),
  };
}
