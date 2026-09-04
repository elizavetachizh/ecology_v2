import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import {
  contractDeleteErrorMessage,
  contractStatusErrorMessage,
  contractWriteErrorMessage,
} from "./contract-write-error";

describe("contractWriteErrorMessage", () => {
  it("maps 400 to date/waste copy", () => {
    expect(
      contractWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toMatch(/цель обязательна/i);
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

describe("contractStatusErrorMessage", () => {
  it("maps 404 to a missing-contract message", () => {
    expect(
      contractStatusErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toBe("Договор не найден.");
  });

  it("maps 400 without the upsert form copy", () => {
    expect(
      contractStatusErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toBe("Не удалось изменить статус договора.");
  });

  it("falls back to the error message", () => {
    expect(contractStatusErrorMessage(new Error("сеть"))).toBe("сеть");
  });
});
