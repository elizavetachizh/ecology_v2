import { describe, expect, it } from "vitest";
import { pod10ReportErrorMessage } from "./pod10-report-error";
import { ApiError } from "../../../shared/api/api-client";

describe("pod10ReportErrorMessage", () => {
  it("maps 400 to period and territory copy", () => {
    expect(
      pod10ReportErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toMatch(/период и территорию/);
  });

  it("maps 502/503 for PDF conversion", () => {
    expect(
      pod10ReportErrorMessage(
        new ApiError("Сервер вернул ошибку 503", 503, "http_error"),
      ),
    ).toBe("Конвертация PDF недоступна. Excel скачать можно.");
    expect(
      pod10ReportErrorMessage(
        new ApiError("Сервер вернул ошибку 502", 502, "http_error"),
      ),
    ).toBe("Не удалось сформировать PDF. Попробуйте позже или скачайте Excel.");
  });

  it("keeps generic Error message", () => {
    expect(pod10ReportErrorMessage(new Error("пустой файл"))).toBe(
      "пустой файл",
    );
  });
});
