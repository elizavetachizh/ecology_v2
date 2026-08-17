import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../shared/api/api-client";
import { getCurrentUser } from "./get-current-user";
import type { CurrentUser } from "../model/user.types";

vi.mock("../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const user: CurrentUser = {
  id: 1,
  realm: "tenant-01",
  uuid: "user-id",
  username: "testuser",
  email: "test@example.com",
  roles: ["operator"],
  issuer: "https://auth.example.com/realms/tenant-01",
};

describe("getCurrentUser", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(user);
  });

  it("requests /me without tenant scope", async () => {
    await expect(getCurrentUser()).resolves.toEqual(user);

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
