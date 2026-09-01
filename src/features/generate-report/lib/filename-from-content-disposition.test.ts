import { describe, expect, it } from "vitest";
import {
  filenameFromContentDisposition,
  pod9FallbackFileName,
} from "./filename-from-content-disposition";

describe("filenameFromContentDisposition", () => {
  it("returns fallback when the header is missing", () => {
    expect(filenameFromContentDisposition(null, "pod-9.xlsx")).toBe(
      "pod-9.xlsx",
    );
  });

  it("reads a quoted filename", () => {
    expect(
      filenameFromContentDisposition(
        'attachment; filename="pod-9_2026-01-01_2026-03-01.xlsx"',
        "fallback.xlsx",
      ),
    ).toBe("pod-9_2026-01-01_2026-03-01.xlsx");
  });

  it("prefers RFC 5987 filename*", () => {
    expect(
      filenameFromContentDisposition(
        "attachment; filename=\"plain.xlsx\"; filename*=UTF-8''pod-9%20%D0%BE%D1%82%D1%87%D1%91%D1%82.xlsx",
        "fallback.xlsx",
      ),
    ).toBe("pod-9 отчёт.xlsx");
  });
});

describe("pod9FallbackFileName", () => {
  it("matches backend filename shape", () => {
    expect(pod9FallbackFileName("2026-01-01", "2026-03-01")).toBe(
      "pod-9_2026-01-01_2026-03-01.xlsx",
    );
    expect(pod9FallbackFileName("2026-01-01", "2026-03-01", "pdf")).toBe(
      "pod-9_2026-01-01_2026-03-01.pdf",
    );
  });
});
