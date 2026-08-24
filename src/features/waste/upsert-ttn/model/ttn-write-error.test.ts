import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { ttnWriteErrorMessage } from "./ttn-write-error";

describe("ttnWriteErrorMessage", () => {
  it("maps 400 to recycling-contract copy", () => {
    expect(
      ttnWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toMatch(/договор утилизации/);
  });
});
