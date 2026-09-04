import { apiFetch } from "../../../../shared/api/api-client";
import type {
  GetPassportsDownloadParams,
  PassportDownloadFile,
  PassportJournalFormat,
} from "../model/passports.types";
import {
  PASSPORT_PDF_MEDIA,
  PASSPORT_XLSX_MEDIA,
  readDownloadFile,
} from "./read-download-file";

function mediaForFormat(format: PassportJournalFormat): string {
  return format === "pdf" ? PASSPORT_PDF_MEDIA : PASSPORT_XLSX_MEDIA;
}

export function passportsJournalFallbackName(
  startDate: string,
  endDate: string,
  format: PassportJournalFormat,
): string {
  return `passports_${startDate}_${endDate}.${format}`;
}

/** GET /api/v1/operations/passports/download — список СП за период, не CRUD list. */
export async function downloadPassports(
  params: GetPassportsDownloadParams,
  signal?: AbortSignal,
): Promise<PassportDownloadFile> {
  const format = params.format ?? "xlsx";
  const searchParams = new URLSearchParams({
    start_date: params.start_date,
    end_date: params.end_date,
    format,
  });
  if (params.unit_id) searchParams.set("unit_id", params.unit_id);

  const response = await apiFetch(
    `/api/v1/operations/passports/download?${searchParams}`,
    { method: "GET", tenantScoped: true, signal },
  );
  return readDownloadFile(
    response,
    mediaForFormat(format),
    passportsJournalFallbackName(params.start_date, params.end_date, format),
  );
}
