import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../shared/api/api-client";
import { fetchReportFile } from "./fetch-report-file";

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

describe("fetchReportFile", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("omits empty query values and sets format", async () => {
    apiFetchMock.mockResolvedValue(
      xlsxResponse({
        contentDisposition: 'attachment; filename="pod-10_a_b.xlsx"',
      }),
    );

    await fetchReportFile({
      path: "/api/v1/reports/pod-10",
      query: {
        start_date: "2026-01-01",
        end_date: "2026-03-01",
        region_id: undefined,
        district_id: null,
        entry_date: "",
      },
      format: "xlsx",
      fallbackFileName: "pod-10_2026-01-01_2026-03-01.xlsx",
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/reports/pod-10?start_date=2026-01-01&end_date=2026-03-01&format=xlsx",
      { tenantScoped: true, signal: undefined },
    );
  });

  it("includes optional numeric filters", async () => {
    apiFetchMock.mockResolvedValue(xlsxResponse());

    await fetchReportFile({
      path: "/api/v1/reports/pod-10",
      query: {
        region_id: 5,
        district_id: 12,
        start_date: "2026-01-01",
        end_date: "2026-03-01",
        entry_date: "2026-03-02",
      },
      format: "xlsx",
      fallbackFileName: "fallback.xlsx",
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/reports/pod-10?region_id=5&district_id=12&start_date=2026-01-01&end_date=2026-03-01&entry_date=2026-03-02&format=xlsx",
      { tenantScoped: true, signal: undefined },
    );
  });

  it("accepts a docx payload and rejects an excel body for that format", async () => {
    const docxType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    apiFetchMock.mockResolvedValueOnce(xlsxResponse());
    await expect(
      fetchReportFile({
        path: "/api/v1/reports/pod-9",
        query: {},
        format: "docx",
        fallbackFileName: "report.docx",
      }),
    ).rejects.toThrow(/неподдерживаемом формате/);

    apiFetchMock.mockResolvedValueOnce(
      new Response(new Blob(["docx-bytes"], { type: docxType }), {
        status: 200,
        headers: new Headers({ "Content-Type": docxType }),
      }),
    );
    const file = await fetchReportFile({
      path: "/api/v1/reports/pod-9",
      query: {},
      format: "docx",
      fallbackFileName: "report.docx",
    });
    expect(file.contentType).toContain(docxType);
    expect(file.fileName).toBe("report.docx");
  });
});
