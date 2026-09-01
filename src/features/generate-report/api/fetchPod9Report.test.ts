import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../shared/api/api-client";
import { fetchPod9Report } from "./fetchPod9Report";

vi.mock("../../../shared/api/api-client", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const XLSX_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const params = {
  unit_id: "550e8400-e29b-41d4-a716-446655440000",
  instruction_id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
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

describe("fetchPod9Report", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("requests GET /api/v1/reports/pod-9 with format=xlsx", async () => {
    apiFetchMock.mockResolvedValue(
      xlsxResponse({
        contentDisposition:
          'attachment; filename="pod-9_2026-01-01_2026-03-01.xlsx"',
      }),
    );

    const file = await fetchPod9Report(params);

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/reports/pod-9?unit_id=550e8400-e29b-41d4-a716-446655440000&instruction_id=6ba7b810-9dad-41d1-80b4-00c04fd430c8&start_date=2026-01-01&end_date=2026-03-01&format=xlsx",
      { tenantScoped: true, signal: undefined },
    );
    expect(file.fileName).toBe("pod-9_2026-01-01_2026-03-01.xlsx");
    expect(file.blob.size).toBeGreaterThan(0);
  });

  it("forwards abort signal", async () => {
    apiFetchMock.mockResolvedValue(xlsxResponse());
    const signal = new AbortController().signal;

    await fetchPod9Report(params, signal);

    expect(apiFetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/reports/pod-9?"),
      { tenantScoped: true, signal },
    );
  });

  it("rejects a non-xlsx content type", async () => {
    apiFetchMock.mockResolvedValue(
      xlsxResponse({ contentType: "application/json" }),
    );

    await expect(fetchPod9Report(params)).rejects.toThrow(
      /неподдерживаемом формате/,
    );
  });

  it("rejects an empty file", async () => {
    apiFetchMock.mockResolvedValue({
      headers: new Headers({ "Content-Type": XLSX_TYPE }),
      blob: async () => ({ size: 0 }) as Blob,
    } as Response);

    await expect(fetchPod9Report(params)).rejects.toThrow(/пустой файл/);
  });

  it("requests format=pdf and accepts application/pdf", async () => {
    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="pod-9_2026-01-01_2026-03-01.pdf"',
    });
    apiFetchMock.mockResolvedValue(
      new Response(new Blob(["pdf-bytes"], { type: "application/pdf" }), {
        status: 200,
        headers,
      }),
    );

    const file = await fetchPod9Report({ ...params, format: "pdf" });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/reports/pod-9?unit_id=550e8400-e29b-41d4-a716-446655440000&instruction_id=6ba7b810-9dad-41d1-80b4-00c04fd430c8&start_date=2026-01-01&end_date=2026-03-01&format=pdf",
      { tenantScoped: true, signal: undefined },
    );
    expect(file.fileName).toBe("pod-9_2026-01-01_2026-03-01.pdf");
  });

  it("rejects a non-pdf content type when format is pdf", async () => {
    apiFetchMock.mockResolvedValue(xlsxResponse({ contentType: XLSX_TYPE }));

    await expect(fetchPod9Report({ ...params, format: "pdf" })).rejects.toThrow(
      /неподдерживаемом формате/,
    );
  });
});
