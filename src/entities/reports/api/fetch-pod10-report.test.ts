import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../shared/api/api-client";
import { fetchPod10Report } from "./fetch-pod10-report";

vi.mock("../../../shared/api/api-client", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const XLSX_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const params = {
  start_date: "2026-01-01",
  end_date: "2026-03-01",
};

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

describe("fetchPod10Report", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("requests GET /api/v1/reports/pod-10 with format=xlsx", async () => {
    apiFetchMock.mockResolvedValue(
      xlsxResponse({
        contentDisposition:
          'attachment; filename="pod-10_2026-01-01_2026-03-01.xlsx"',
      }),
    );

    const file = await fetchPod10Report(params);

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/reports/pod-10?start_date=2026-01-01&end_date=2026-03-01&format=xlsx",
      { tenantScoped: true, signal: undefined },
    );
    expect(file.fileName).toBe("pod-10_2026-01-01_2026-03-01.xlsx");
    expect(file.blob.size).toBeGreaterThan(0);
  });

  it("includes optional geo and entry_date", async () => {
    apiFetchMock.mockResolvedValue(xlsxResponse());

    await fetchPod10Report({
      ...params,
      region_id: 1,
      district_id: 2,
      entry_date: "2026-03-02",
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/reports/pod-10?region_id=1&district_id=2&start_date=2026-01-01&end_date=2026-03-01&entry_date=2026-03-02&format=xlsx",
      { tenantScoped: true, signal: undefined },
    );
  });

  it("requests format=pdf and accepts application/pdf", async () => {
    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="pod-10_2026-01-01_2026-03-01.pdf"',
    });
    apiFetchMock.mockResolvedValue(
      new Response(new Blob(["pdf-bytes"], { type: "application/pdf" }), {
        status: 200,
        headers,
      }),
    );

    const file = await fetchPod10Report({ ...params, format: "pdf" });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/reports/pod-10?start_date=2026-01-01&end_date=2026-03-01&format=pdf",
      { tenantScoped: true, signal: undefined },
    );
    expect(file.fileName).toBe("pod-10_2026-01-01_2026-03-01.pdf");
  });

  it("rejects a non-pdf content type when format is pdf", async () => {
    apiFetchMock.mockResolvedValue(xlsxResponse({ contentType: XLSX_TYPE }));

    await expect(
      fetchPod10Report({ ...params, format: "pdf" }),
    ).rejects.toThrow(/неподдерживаемом формате/);
  });
});
