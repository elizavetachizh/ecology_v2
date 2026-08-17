import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updateInstruction } from "./update-instruction";
import { instructionFixture } from "../model/instruction.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updateInstruction", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(instructionFixture);
  });

  it("patches by id, tenant-scoped", async () => {
    const body = { name: "Обновлённая", status: "inactive" as const };
    await expect(updateInstruction("ins-1", body)).resolves.toEqual(
      instructionFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/instructions/ins-1",
      {
        method: "PATCH",
        body,
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await updateInstruction("ins-1", { name: "Обновлённая" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/instructions/ins-1",
      {
        method: "PATCH",
        body: { name: "Обновлённая" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
