import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../../shared/api/api-client";
import { downloadPassports } from "./download-passports";
import { PASSPORT_XLSX_MEDIA } from "./read-download-file";

vi.mock("../../../../shared/api/api-client", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const params = {
  start_date: "2026-01-01",
  end_date: "2026-12-31",
};

function fileResponse(init?: {
  contentType?: string;
  contentDisposition?: string;
}) {
  const headers = new Headers({
    "Content-Type": init?.contentType ?? PASSPORT_XLSX_MEDIA,
  });
  if (init?.contentDisposition) {
    headers.set("Content-Disposition", init.contentDisposition);
  }
  return new Response(new Blob(["xlsx-bytes"], { type: PASSPORT_XLSX_MEDIA }), {
    status: 200,
    headers,
  });
}

describe("downloadPassports", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("requests GET /download with period and format=xlsx", async () => {
    apiFetchMock.mockResolvedValue(
      fileResponse({
        contentDisposition:
          'attachment; filename="passports_2026-01-01_2026-12-31.xlsx"',
      }),
    );

    const file = await downloadPassports(params);

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/download?start_date=2026-01-01&end_date=2026-12-31&format=xlsx",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
    expect(file.fileName).toBe("passports_2026-01-01_2026-12-31.xlsx");
  });

  it("includes unit_id and format=pdf when provided", async () => {
    apiFetchMock.mockResolvedValue(
      fileResponse({ contentType: "application/pdf" }),
    );

    await downloadPassports({
      ...params,
      unit_id: "unit-1",
      format: "pdf",
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/download?start_date=2026-01-01&end_date=2026-12-31&format=pdf&unit_id=unit-1",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("omits empty unit_id", async () => {
    apiFetchMock.mockResolvedValue(fileResponse());

    await downloadPassports({ ...params, unit_id: "" });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/download?start_date=2026-01-01&end_date=2026-12-31&format=xlsx",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("forwards abort signal", async () => {
    apiFetchMock.mockResolvedValue(fileResponse());
    const signal = new AbortController().signal;

    await downloadPassports(params, signal);

    expect(apiFetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/operations/passports/download?"),
      { method: "GET", tenantScoped: true, signal },
    );
  });
});
