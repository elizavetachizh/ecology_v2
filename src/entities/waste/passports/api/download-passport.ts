import { apiFetch } from "../../../../shared/api/api-client";
import type {
  PassportDownloadFile,
  PassportFileFormat,
} from "../model/passports.types";
import {
  PASSPORT_DOCX_MEDIA,
  PASSPORT_PDF_MEDIA,
  readDownloadFile,
} from "./read-download-file";

function mediaForFormat(format: PassportFileFormat): string {
  return format === "pdf" ? PASSPORT_PDF_MEDIA : PASSPORT_DOCX_MEDIA;
}

export function passportFileFallbackName(
  number: string,
  format: PassportFileFormat,
): string {
  return `passport_${number}.${format}`;
}

/** GET /api/v1/operations/passports/{id}/download */
export async function downloadPassport(
  id: string,
  options: { format?: PassportFileFormat; number?: string } = {},
  signal?: AbortSignal,
): Promise<PassportDownloadFile> {
  const format = options.format ?? "docx";
  const searchParams = new URLSearchParams({ format });
  const response = await apiFetch(
    `/api/v1/operations/passports/${id}/download?${searchParams}`,
    { method: "GET", tenantScoped: true, signal },
  );
  return readDownloadFile(
    response,
    mediaForFormat(format),
    passportFileFallbackName(options.number || id, format),
  );
}
