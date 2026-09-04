import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { passportDownloadErrorMessage } from "./passport-download-error";

describe("passportDownloadErrorMessage", () => {
  it("maps known download statuses", () => {
    expect(
      passportDownloadErrorMessage(new ApiError("x", 404, "http_error")),
    ).toMatch(/не найден/i);
    expect(
      passportDownloadErrorMessage(new ApiError("x", 400, "http_error")),
    ).toMatch(/период/i);
    expect(
      passportDownloadErrorMessage(new ApiError("x", 503, "http_error")),
    ).toMatch(/PDF/i);
    expect(
      passportDownloadErrorMessage(new ApiError("x", 502, "http_error")),
    ).toMatch(/PDF/i);
  });

  it("falls back to the error message", () => {
    expect(passportDownloadErrorMessage(new Error("сеть"))).toBe("сеть");
    expect(passportDownloadErrorMessage("nope")).toBe(
      "Не удалось скачать файл",
    );
  });
});
