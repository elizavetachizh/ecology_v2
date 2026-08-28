import { parseExcelPreview } from "../lib/parseExcelPreview";
import type { Pod9ReportParams } from "../model/pod9-params";
import type { ReportPreview } from "../model/preview.types";
import { generatePod9Report } from "./generatePod9Report";

export async function previewPod9Report(
  params: Pod9ReportParams,
  signal?: AbortSignal,
): Promise<ReportPreview> {
  const file = await generatePod9Report(params, signal);
  const sheets = await parseExcelPreview(file.blob);
  if (sheets.length === 0) {
    throw new Error("В файле нет листов для предпросмотра");
  }

  return {
    ...file,
    sheets,
  };
}
