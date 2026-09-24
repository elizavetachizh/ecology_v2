import { fetchReportFile } from "./fetch-report-file";
import { reportFallbackFileName } from "../lib/filename-from-content-disposition";
import type {
  GeneratedReportFile,
  Pod9ReportParams,
} from "../model/reports.types";
import { pod9ReportPath } from "./paths";

/** GET /api/v1/reports/pod-9 — xlsx download or PDF preview/download. */
export function fetchPod9Report(
  params: Pod9ReportParams,
  signal?: AbortSignal,
): Promise<GeneratedReportFile> {
  const format = params.format ?? "xlsx";
  return fetchReportFile({
    path: pod9ReportPath(),
    query: {
      unit_id: params.unit_id,
      start_date: params.start_date,
      end_date: params.end_date,
    },
    format,
    fallbackFileName: reportFallbackFileName(
      "pod-9",
      params.start_date,
      params.end_date,
      format,
    ),
    signal,
  });
}
