import { fetchReportFile } from "./fetch-report-file";
import { reportFallbackFileName } from "../lib/filename-from-content-disposition";
import type {
  GeneratedReportFile,
  Pod10ReportParams,
} from "../model/reports.types";
import { pod10ReportPath } from "./paths";

/** GET /api/v1/reports/pod-10 — xlsx download or PDF preview/download. */
export function fetchPod10Report(
  params: Pod10ReportParams,
  signal?: AbortSignal,
): Promise<GeneratedReportFile> {
  const format = params.format ?? "xlsx";
  return fetchReportFile({
    path: pod10ReportPath(),
    query: {
      region_id: params.region_id,
      district_id: params.district_id,
      start_date: params.start_date,
      end_date: params.end_date,
      entry_date: params.entry_date,
    },
    format,
    fallbackFileName: reportFallbackFileName(
      "pod-10",
      params.start_date,
      params.end_date,
      format,
    ),
    signal,
  });
}
