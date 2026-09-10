/** Query params for GET /api/v1/reports/pod-9. tenant_id is X-Tenant-Id. */
export type Pod10ReportFormat = "xlsx" | "pdf";

export type Pod10ReportParams = {
  region_id: number;
  district_id?: number;
  start_date: string;
  end_date: string;
  entry_date?: string;
  format?: Pod10ReportFormat;
};
