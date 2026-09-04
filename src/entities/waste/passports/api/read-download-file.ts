import type { PassportDownloadFile } from "../model/passports.types";

export const PASSPORT_PDF_MEDIA = "application/pdf";
export const PASSPORT_DOCX_MEDIA =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const PASSPORT_XLSX_MEDIA =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function filenameFromContentDisposition(
  header: string | null,
  fallback: string,
): string {
  if (!header) return fallback;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/^["']|["']$/g, ""));
    } catch {
      return fallback;
    }
  }

  const fileNameMatch = header.match(/filename="?([^";]+)"?/i);
  return fileNameMatch?.[1]?.trim() || fallback;
}

export async function readDownloadFile(
  response: Response,
  expectedMedia: string,
  fallbackFileName: string,
): Promise<PassportDownloadFile> {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes(expectedMedia)) {
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
      fallbackFileName,
    ),
  };
}
