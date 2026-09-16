import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../shared/api/api-client";
import { fetchStatReport } from "./fetch-stat-report";

vi.mock("../../../shared/api/api-client", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const XLSX_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function xlsxResponse(init?: {
  contentType?: string;
  contentDisposition?: string;
}) {
  const headers = new Headers({
    "Content-Type": init?.contentType ?? XLSX_TYPE,
  });
  if (init?.contentDisposition) {
    headers.set("Content-Disposition", init.contentDisposition);
  }
  return new Response(new Blob(["xlsx-bytes"], { type: XLSX_TYPE }), {
    status: 200,
    headers,
  });
}

describe("fetchStatReport", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("requests GET /api/v1/reports/stat with year and format=xlsx", async () => {
    apiFetchMock.mockResolvedValue(
      xlsxResponse({
        contentDisposition: 'attachment; filename="stat_2026.xlsx"',
      }),
    );

    const file = await fetchStatReport({ year: 2026 });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/reports/stat?year=2026&format=xlsx",
      { tenantScoped: true, signal: undefined },
    );
    expect(file.fileName).toBe("stat_2026.xlsx");
    expect(file.blob.size).toBeGreaterThan(0);
  });

  it("requests format=pdf and accepts application/pdf", async () => {
    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="stat_2026.pdf"',
    });
    apiFetchMock.mockResolvedValue(
      new Response(new Blob(["pdf-bytes"], { type: "application/pdf" }), {
        status: 200,
        headers,
      }),
    );

    const file = await fetchStatReport({ year: 2026, format: "pdf" });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/reports/stat?year=2026&format=pdf",
      { tenantScoped: true, signal: undefined },
    );
    expect(file.fileName).toBe("stat_2026.pdf");
  });

  it("rejects a non-pdf content type when format is pdf", async () => {
    apiFetchMock.mockResolvedValue(xlsxResponse({ contentType: XLSX_TYPE }));

    await expect(
      fetchStatReport({ year: 2026, format: "pdf" }),
    ).rejects.toThrow(/неподдерживаемом формате/);
  });
});
