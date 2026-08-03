import type {
  ReportPreviewCell,
  ReportPreviewSheet,
} from "../model/preview.types";

export async function parseExcelPreview(
  blob: Blob,
): Promise<ReportPreviewSheet[]> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await blob.arrayBuffer(), {
    type: "array",
    cellDates: true,
  });

  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const reference = sheet["!ref"];
    if (!reference) return { name, rows: [] };

    const range = XLSX.utils.decode_range(reference);
    const rows: ReportPreviewCell[][] = Array.from(
      { length: range.e.r - range.s.r + 1 },
      (_, rowOffset) =>
        Array.from(
          { length: range.e.c - range.s.c + 1 },
          (_, columnOffset) => {
            const address = XLSX.utils.encode_cell({
              r: range.s.r + rowOffset,
              c: range.s.c + columnOffset,
            });
            const cell = sheet[address];

            return {
              value: cell ? XLSX.utils.format_cell(cell) : "",
              rowSpan: 1,
              colSpan: 1,
              hidden: false,
            };
          },
        ),
    );

    for (const merge of sheet["!merges"] ?? []) {
      if (
        merge.s.r < range.s.r ||
        merge.s.c < range.s.c ||
        merge.e.r > range.e.r ||
        merge.e.c > range.e.c
      ) {
        continue;
      }

      const startRow = merge.s.r - range.s.r;
      const startColumn = merge.s.c - range.s.c;
      rows[startRow][startColumn].rowSpan = merge.e.r - merge.s.r + 1;
      rows[startRow][startColumn].colSpan = merge.e.c - merge.s.c + 1;

      for (let row = merge.s.r; row <= merge.e.r; row += 1) {
        for (let column = merge.s.c; column <= merge.e.c; column += 1) {
          if (row === merge.s.r && column === merge.s.c) continue;
          rows[row - range.s.r][column - range.s.c].hidden = true;
        }
      }
    }

    return {
      name,
      rows,
    };
  });
}
