import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiDelete,
  apiFetch,
  apiSendJson,
  setTenantIdResolver,
  setUnauthorizedHandler,
} from "./api-client";
import {
  forceRefreshAccessToken,
  refreshAccessToken,
} from "../auth/token-refresh";

vi.mock("../auth/token-refresh", () => ({
  refreshAccessToken: vi.fn(),
  forceRefreshAccessToken: vi.fn(),
}));

vi.mock("../config/env", () => ({
  getAppEnv: () => ({ apiBaseUrl: "https://api.example.com" }),
}));

const refreshMock = vi.mocked(refreshAccessToken);
const forceRefreshMock = vi.mocked(forceRefreshAccessToken);

describe("api client", () => {
  beforeEach(() => {
    refreshMock.mockResolvedValue("token-1");
    forceRefreshMock.mockResolvedValue("token-2");
    setTenantIdResolver(() => null);
    setUnauthorizedHandler(() => undefined);
    vi.stubGlobal("fetch", vi.fn());
  });

  it("adds tenant id only to tenant-scoped requests", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    setTenantIdResolver(() => "tenant-id");

    await apiFetch("/shared");
    await apiFetch("/domain", { tenantScoped: true });

    const sharedHeaders = new Headers(fetchMock.mock.calls[0]![1]?.headers);
    const scopedHeaders = new Headers(fetchMock.mock.calls[1]![1]?.headers);
    expect(sharedHeaders.has("X-Tenant-Id")).toBe(false);
    expect(scopedHeaders.get("X-Tenant-Id")).toBe("tenant-id");
    expect(scopedHeaders.get("Authorization")).toBe("Bearer token-1");
  });

  it("performs at most one forced refresh and retry after 401", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    await apiFetch("/protected");

    expect(forceRefreshMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not refresh after 403", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 403 }));

    await expect(apiFetch("/forbidden")).rejects.toMatchObject({
      status: 403,
      code: "forbidden",
    });
    expect(forceRefreshMock).not.toHaveBeenCalled();
  });

  it("reports refresh_failed when pre-request refresh fails", async () => {
    const onUnauthorized = vi.fn();
    refreshMock.mockRejectedValue(new Error("refresh failed"));
    setUnauthorizedHandler(onUnauthorized);

    await expect(apiFetch("/protected")).rejects.toMatchObject({
      status: 401,
      code: "refresh_failed",
    });
    expect(onUnauthorized).toHaveBeenCalledOnce();
    expect(onUnauthorized.mock.calls[0]![0]).toMatchObject({
      code: "refresh_failed",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports token_rejected when backend keeps returning 401 after refresh", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }));

    await expect(apiFetch("/protected")).rejects.toMatchObject({
      status: 401,
      code: "token_rejected",
    });
    expect(forceRefreshMock).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledOnce();
    expect(onUnauthorized.mock.calls[0]![0]).toMatchObject({
      code: "token_rejected",
    });
  });

  it("deduplicates concurrent unauthorized notifications without blocking later requests", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }));

    await Promise.allSettled([apiFetch("/first"), apiFetch("/second")]);
    expect(onUnauthorized).toHaveBeenCalledOnce();

    await expect(apiFetch("/later")).rejects.toMatchObject({
      code: "token_rejected",
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalled();
  });

  it("serializes JSON body and sets content-type for apiSendJson", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    setTenantIdResolver(() => "tenant-id");

    await expect(
      apiSendJson("/api/v1/mdm/wastes", {
        method: "POST",
        body: { name: "oil" },
        tenantScoped: true,
      }),
    ).resolves.toEqual({ id: "1" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]![1];
    const headers = new Headers(init?.headers);
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ name: "oil" }));
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("X-Tenant-Id")).toBe("tenant-id");
  });

  it("sends DELETE without a body for apiDelete", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    setTenantIdResolver(() => "tenant-id");

    await apiDelete("/api/v1/mdm/wastes/1", { tenantScoped: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]![1];
    const headers = new Headers(init?.headers);
    expect(init?.method).toBe("DELETE");
    expect(init?.body).toBeUndefined();
    expect(headers.has("Content-Type")).toBe(false);
    expect(headers.get("X-Tenant-Id")).toBe("tenant-id");
  });
});
