import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { counterpartyWriteErrorMessage } from "./counterparty-write-error";

describe("counterpartyWriteErrorMessage", () => {
  it("maps 409 to UNP conflict copy", () => {
    expect(
      counterpartyWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 409", 409, "http_error"),
      ),
    ).toBe("Контрагент с таким УНП уже есть в этой организации.");
  });

  it("maps 422 to field hint", () => {
    expect(
      counterpartyWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 422", 422, "http_error"),
      ),
    ).toMatch(/УНП/);
  });
});
