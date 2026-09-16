import { fetchReportFile } from "./fetch-report-file";
import type {
  GeneratedReportFile,
  StatReportParams,
} from "../model/reports.types";
import { statReportPath } from "./paths";

/** GET /api/v1/reports/stat — xlsx download or PDF preview/download. */
export function fetchStatReport(
  params: StatReportParams,
  signal?: AbortSignal,
): Promise<GeneratedReportFile> {
  const format = params.format ?? "xlsx";
  return fetchReportFile({
    path: statReportPath(),
    query: { year: params.year },
    format,
    fallbackFileName: `stat_${params.year}.${format}`,
    signal,
  });
}
