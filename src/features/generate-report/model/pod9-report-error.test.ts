import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/api-client";
import { pod9ReportErrorMessage } from "./pod9-report-error";

describe("pod9ReportErrorMessage", () => {
  it("maps 404 to unit/instruction copy", () => {
    expect(
      pod9ReportErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toMatch(/Место учёта или инструкция/);
  });

  it("maps 400 to period copy", () => {
    expect(
      pod9ReportErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toMatch(/период/);
  });

  it("maps 502/503 for PDF conversion", () => {
    expect(
      pod9ReportErrorMessage(
        new ApiError("Сервер вернул ошибку 503", 503, "http_error"),
      ),
    ).toBe("Конвертация PDF недоступна. Excel скачать можно.");
    expect(
      pod9ReportErrorMessage(
        new ApiError("Сервер вернул ошибку 502", 502, "http_error"),
      ),
    ).toBe(
      "Не удалось сформировать PDF. Попробуйте позже или скачайте Excel.",
    );
  });

  it("keeps generic Error message", () => {
    expect(pod9ReportErrorMessage(new Error("пустой файл"))).toBe(
      "пустой файл",
    );
  });
});
