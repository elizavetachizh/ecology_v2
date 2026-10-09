import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { vehicleWriteErrorMessage } from "./vehicle-write-error";

describe("vehicleWriteErrorMessage", () => {
  it("maps 409 to a plate or Beltopgas conflict", () => {
    expect(
      vehicleWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 409", 409, "http_error"),
      ),
    ).toBe("Транспорт с таким госномером или ID Белтопгаз уже есть.");
  });

  it("maps 422 to a field hint", () => {
    expect(
      vehicleWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 422", 422, "http_error"),
      ),
    ).toBe("Проверьте марку, модель, госномер и массу.");
  });

  it("maps 404 to a missing vehicle", () => {
    expect(
      vehicleWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toBe("Транспортное средство не найдено.");
  });

  it("passes through an error message", () => {
    expect(vehicleWriteErrorMessage(new Error("Сеть недоступна"))).toBe(
      "Сеть недоступна",
    );
  });
});
