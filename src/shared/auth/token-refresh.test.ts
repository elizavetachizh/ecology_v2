import type Keycloak from "keycloak-js";
import { describe, expect, it, vi } from "vitest";
import { forceRefreshAccessToken, refreshAccessToken } from "./token-refresh";

function createClient(updateToken: (minValidity: number) => Promise<boolean>) {
  return {
    authenticated: true,
    token: "access-token",
    updateToken,
  } as unknown as Keycloak;
}

describe("token refresh coordinator", () => {
  it("deduplicates simultaneous refresh calls", async () => {
    let resolveRefresh!: (value: boolean) => void;
    const updateToken = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveRefresh = resolve;
        }),
    );
    const client = createClient(updateToken);

    const first = refreshAccessToken(30, client);
    const second = refreshAccessToken(30, client);
    resolveRefresh(false);

    await expect(Promise.all([first, second])).resolves.toEqual([
      "access-token",
      "access-token",
    ]);
    expect(updateToken).toHaveBeenCalledTimes(1);
  });

  it("uses -1 for a forced refresh", async () => {
    const updateToken = vi.fn().mockResolvedValue(true);
    await forceRefreshAccessToken(createClient(updateToken));
    expect(updateToken).toHaveBeenCalledWith(-1);
  });
});
