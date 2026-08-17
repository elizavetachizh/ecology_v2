import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getInstruction } from "./get-instruction";
import { instructionFixture } from "../model/instruction.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getInstruction", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(instructionFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getInstruction("ins-1")).resolves.toEqual(instructionFixture);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/instructions/ins-1", {
      method: "GET",
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getInstruction("ins-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/instructions/ins-1", {
      method: "GET",
      tenantScoped: true,
      signal,
    });
  });
});
