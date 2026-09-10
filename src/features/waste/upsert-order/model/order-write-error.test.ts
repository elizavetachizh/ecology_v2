import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { orderWriteErrorMessage } from "./order-write-error";

describe("orderWriteErrorMessage", () => {
  it("maps 404 to missing order or unit copy", () => {
    expect(
      orderWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toMatch(/Приказ или подразделение не найдено/);
  });

  it("maps 409 to unit or tenant-wide start_date conflict copy", () => {
    expect(
      orderWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 409", 409, "http_error"),
      ),
    ).toMatch(/приказ с такой датой начала/);
  });

  it("maps 422 to validation copy", () => {
    expect(
      orderWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 422", 422, "http_error"),
      ),
    ).toMatch(/номер/);
  });
});
