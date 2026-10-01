import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { personWriteErrorMessage } from "./person-write-error";

describe("personWriteErrorMessage", () => {
  it("maps 409 to a Beltopgas conflict", () => {
    expect(
      personWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 409", 409, "http_error"),
      ),
    ).toBe("Ответственный с таким идентификатором Белтопгаз уже есть.");
  });

  it("maps 404 to a missing unit", () => {
    expect(
      personWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toBe("Подразделение не найдено.");
  });

  it("maps 422 to a field hint", () => {
    expect(
      personWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 422", 422, "http_error"),
      ),
    ).toBe("Проверьте наименование и ФИО.");
  });
});
