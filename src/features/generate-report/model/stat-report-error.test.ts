import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/api-client";
import { statReportErrorMessage } from "./stat-report-error";

describe("statReportErrorMessage", () => {
  it("maps 422 to year copy", () => {
    expect(
      statReportErrorMessage(
        new ApiError("Сервер вернул ошибку 422", 422, "http_error"),
      ),
    ).toMatch(/отчётный год/);
  });

  it("maps 502/503 for PDF conversion", () => {
    expect(
      statReportErrorMessage(
        new ApiError("Сервер вернул ошибку 503", 503, "http_error"),
      ),
    ).toBe("Конвертация PDF недоступна. Excel скачать можно.");
    expect(
      statReportErrorMessage(
        new ApiError("Сервер вернул ошибку 502", 502, "http_error"),
      ),
    ).toBe("Не удалось сформировать PDF. Попробуйте позже или скачайте Excel.");
  });

  it("keeps generic Error message", () => {
    expect(statReportErrorMessage(new Error("пустой файл"))).toBe("пустой файл");
  });
});
