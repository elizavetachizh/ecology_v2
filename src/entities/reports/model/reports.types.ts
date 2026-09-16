export const REPORT_FORMATS = ["xlsx", "pdf"] as const;
export type ReportFormat = (typeof REPORT_FORMATS)[number];

/** Blob returned by GET /api/v1/reports/* */
export type GeneratedReportFile = {
  fileName: string;
  contentType: string;
  blob: Blob;
};

/** Query params for GET /api/v1/reports/pod-9. tenant_id is X-Tenant-Id. */
export type Pod9ReportParams = {
  unit_id: string;
  instruction_id: string;
  start_date: string;
  end_date: string;
  format?: ReportFormat;
};

/** Query params for GET /api/v1/reports/pod-10. tenant_id is X-Tenant-Id. */
export type Pod10ReportParams = {
  region_id?: number | null;
  district_id?: number | null;
  start_date: string;
  end_date: string;
  entry_date?: string | null;
  format?: ReportFormat;
};

/** Bounds for GET /api/v1/reports/stat `year`. */
export const STAT_REPORT_YEAR_MIN = 1900;
export const STAT_REPORT_YEAR_MAX = 2100;

/** Query params for GET /api/v1/reports/stat. tenant_id is X-Tenant-Id. */
export type StatReportParams = {
  year: number;
  format?: ReportFormat;
};
