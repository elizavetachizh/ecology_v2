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

export type ReportPreview = {
  fileName: string;
  contentType: string;
  blob: Blob;
  sheets: ReportPreviewSheet[];
};

export type Pod9ReportPreviewParams = {
  company: string;
  department: string;
  wastes: string;
  startDate: string;
  endDate: string;
};
