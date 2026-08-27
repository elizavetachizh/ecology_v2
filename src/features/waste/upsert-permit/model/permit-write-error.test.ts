import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/api-client";
import { permitWriteErrorMessage } from "./permit-write-error";

describe("permitWriteErrorMessage", () => {
  it("maps 404 to unit/waste copy", () => {
    expect(
      permitWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 404", 404, "http_error"),
      ),
    ).toMatch(/Подразделение или отход/);
  });

  it("maps 400 to date/waste copy", () => {
    expect(
      permitWriteErrorMessage(
        new ApiError("Сервер вернул ошибку 400", 400, "http_error"),
      ),
    ).toMatch(/отходы/);
  });
});
