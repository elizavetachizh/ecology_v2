import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { standardWriteErrorMessage } from "./standard-write-error";

describe("standardWriteErrorMessage", () => {
  it("maps 404 to unit/waste copy", () => {
    expect(
      standardWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toMatch(/Подразделение или отход/);
  });

  it("maps 409 to unit+start_date conflict copy", () => {
    expect(
      standardWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 409", 409, "http_error"),
      ),
    ).toMatch(/уже есть норматив/);
  });

  it("maps 400 to waste copy", () => {
    expect(
      standardWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toMatch(/отход/);
  });
});
