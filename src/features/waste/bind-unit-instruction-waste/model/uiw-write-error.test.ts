import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { uiwDeleteErrorMessage, uiwWriteErrorMessage } from "./uiw-write-error";

describe("uiwWriteErrorMessage", () => {
  it("maps 404 to missing binding copy", () => {
    expect(
      uiwWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toBe("Привязка отхода не найдена.");
  });

  it("maps 409 to duplicate binding copy", () => {
    expect(
      uiwWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 409", 409, "http_error"),
      ),
    ).toBe("Такая привязка отхода уже существует.");
  });

  it("keeps a generic Error message", () => {
    expect(uiwWriteErrorMessage(new Error("Сеть недоступна"))).toBe(
      "Сеть недоступна",
    );
  });

  it("falls back when the value is not an Error", () => {
    expect(uiwWriteErrorMessage("boom")).toBe(
      "Не удалось сохранить привязку отхода",
    );
  });
});

describe("uiwDeleteErrorMessage", () => {
  it("keeps a generic Error message", () => {
    expect(uiwDeleteErrorMessage(new Error("Сеть недоступна"))).toBe(
      "Сеть недоступна",
    );
  });

  it("falls back when the value is not an Error", () => {
    expect(uiwDeleteErrorMessage("boom")).toBe(
      "Не удалось удалить привязку отхода",
    );
  });
});
