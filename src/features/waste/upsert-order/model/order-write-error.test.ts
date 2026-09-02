import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { orderWriteErrorMessage } from "./order-write-error";

describe("orderWriteErrorMessage", () => {
  it("maps 404 to missing unit copy", () => {
    expect(
      orderWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toMatch(/Подразделение не найдено/);
  });

  it("maps 409 to unit+start_date conflict copy", () => {
    expect(
      orderWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 409", 409, "http_error"),
      ),
    ).toMatch(/уже есть приказ/);
  });

  it("maps 422 to validation copy", () => {
    expect(
      orderWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 422", 422, "http_error"),
      ),
    ).toMatch(/номер/);
  });
});
