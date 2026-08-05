import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLogout } from "./use-logout";
import { getKeycloak } from "../../../../shared/auth/keycloak";
import { clearSessionState } from "../../../../shared/auth/cleanup-session";

const { logout } = vi.hoisted(() => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../../shared/auth/keycloak", () => ({
  getKeycloak: vi.fn(() => ({ logout })),
}));
vi.mock("../../../../shared/auth/cleanup-session", () => ({
  clearSessionState: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../shared/config/env", () => ({
  getAppEnv: () => ({ appUrl: "https://app.example.com" }),
}));

describe("useLogout", () => {
  it("clears local state before ending the Keycloak session", async () => {
    const { result } = renderHook(() => useLogout());

    await act(() => result.current.logout());

    expect(clearSessionState).toHaveBeenCalledOnce();
    expect(getKeycloak).toHaveBeenCalledOnce();
    expect(logout).toHaveBeenCalledWith({
      redirectUri: "https://app.example.com",
    });
    expect(
      vi.mocked(clearSessionState).mock.invocationCallOrder[0],
    ).toBeLessThan(logout.mock.invocationCallOrder[0]!);
  });
});
