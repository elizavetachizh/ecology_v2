export type ReportPreviewCell = {
  value: string;
  rowSpan: number;
  colSpan: number;
  hidden: boolean;
};

export type ReportPreviewSheet = {
  name: string;
  rows: ReportPreviewCell[][];
};

export type GeneratedReportFile = {
  fileName: string;
  contentType: string;
  blob: Blob;
};

export type ReportPreview = GeneratedReportFile & {
  sheets: ReportPreviewSheet[];
};
