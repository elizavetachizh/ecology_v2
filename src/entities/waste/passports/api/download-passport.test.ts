import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../../shared/api/api-client";
import { downloadPassport } from "./download-passport";
import { PASSPORT_PDF_MEDIA } from "./read-download-file";

vi.mock("../../../../shared/api/api-client", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

function fileResponse(init?: {
  contentType?: string;
  contentDisposition?: string;
}) {
  const headers = new Headers({
    "Content-Type": init?.contentType ?? PASSPORT_PDF_MEDIA,
  });
  if (init?.contentDisposition) {
    headers.set("Content-Disposition", init.contentDisposition);
  }
  return new Response(new Blob(["pdf-bytes"], { type: PASSPORT_PDF_MEDIA }), {
    status: 200,
    headers,
  });
}

describe("downloadPassport", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("requests GET /{id}/download with format=pdf", async () => {
    apiFetchMock.mockResolvedValue(
      fileResponse({
        contentDisposition: 'attachment; filename="passport_SP-001.pdf"',
      }),
    );

    const file = await downloadPassport("p-1", {
      format: "pdf",
      number: "SP-001",
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/p-1/download?format=pdf",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
    expect(file.fileName).toBe("passport_SP-001.pdf");
    expect(file.blob.size).toBeGreaterThan(0);
  });

  it("defaults format to docx", async () => {
    apiFetchMock.mockResolvedValue(
      fileResponse({
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    );

    await downloadPassport("p-1", { number: "SP-001" });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/p-1/download?format=docx",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("forwards abort signal", async () => {
    apiFetchMock.mockResolvedValue(fileResponse());
    const signal = new AbortController().signal;

    await downloadPassport("p-1", { format: "pdf" }, signal);

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/p-1/download?format=pdf",
      { method: "GET", tenantScoped: true, signal },
    );
  });

  it("rejects a mismatched content type", async () => {
    apiFetchMock.mockResolvedValue(
      fileResponse({ contentType: "application/json" }),
    );

    await expect(downloadPassport("p-1", { format: "pdf" })).rejects.toThrow(
      /неподдерживаемом формате/,
    );
  });
});
