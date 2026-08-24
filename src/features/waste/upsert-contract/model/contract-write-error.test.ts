import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import {
  contractDeleteErrorMessage,
  contractWriteErrorMessage,
} from "./contract-write-error";

describe("contractWriteErrorMessage", () => {
  it("maps 400 to date/waste copy", () => {
    expect(
      contractWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toMatch(/отходы/);
  });
});

describe("contractDeleteErrorMessage", () => {
  it("maps 400 to passport/TTN copy", () => {
    expect(
      contractDeleteErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toMatch(/паспорт или ТТН/);
  });
});
