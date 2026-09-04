import { describe, expect, it } from "vitest";
import { filenameFromContentDisposition } from "./read-download-file";

describe("filenameFromContentDisposition", () => {
  it("reads filename* UTF-8", () => {
    expect(
      filenameFromContentDisposition(
        "attachment; filename*=UTF-8''passport_%D0%A1%D0%9F-001.pdf",
        "fallback.pdf",
      ),
    ).toBe("passport_СП-001.pdf");
  });

  it("reads quoted filename", () => {
    expect(
      filenameFromContentDisposition(
        'attachment; filename="passports_2026-01-01_2026-12-31.xlsx"',
        "fallback.xlsx",
      ),
    ).toBe("passports_2026-01-01_2026-12-31.xlsx");
  });

  it("returns fallback when the header is missing", () => {
    expect(filenameFromContentDisposition(null, "fallback.pdf")).toBe(
      "fallback.pdf",
    );
  });
});
