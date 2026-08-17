import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createInstruction } from "./create-instruction";
import { instructionFixture } from "../model/instruction.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("createInstruction", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(instructionFixture);
  });

  it("posts create body, tenant-scoped", async () => {
    const body = {
      name: "Инструкция по утилизации",
      short_name: "ИООС-1",
      status: "active" as const,
    };
    await expect(createInstruction(body)).resolves.toEqual(instructionFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/instructions", {
      method: "POST",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await createInstruction({ name: "Инструкция" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/instructions", {
      method: "POST",
      body: { name: "Инструкция" },
      tenantScoped: true,
      signal,
    });
  });
});
