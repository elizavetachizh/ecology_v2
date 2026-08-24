import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { passportWriteErrorMessage } from "./passport-write-error";

describe("passportWriteErrorMessage", () => {
  it("maps 400 to contract/wastes copy", () => {
    expect(
      passportWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toMatch(/договор утилизации/);
  });

  it("maps 404 to missing refs copy", () => {
    expect(
      passportWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toMatch(/не найден/);
  });
});
