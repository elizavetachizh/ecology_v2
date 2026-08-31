import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { operationWriteErrorMessage } from "./operation-write-error";

describe("operationWriteErrorMessage", () => {
  it("maps 400 to a save constraint message", () => {
    expect(
      operationWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toMatch(/остаток/i);
  });

  it("maps 404 to a missing entity message", () => {
    expect(
      operationWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toMatch(/не найден/i);
  });

  it("falls back to Error.message", () => {
    expect(operationWriteErrorMessage(new Error("Недостаточно остатка"))).toBe(
      "Недостаточно остатка",
    );
  });
});
