import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../shared/api/api-client";
import { getCurrentUser } from "./get-current-user";
import { currentUserFixture } from "../model/user.fixture";

vi.mock("../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getCurrentUser", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(currentUserFixture);
  });

  it("requests /me without tenant scope", async () => {
    await expect(getCurrentUser()).resolves.toEqual(currentUserFixture);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/me", {
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getCurrentUser(signal);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/me", { signal });
  });
});
