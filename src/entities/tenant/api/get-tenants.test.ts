import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../shared/api/api-client";
import { getTenants } from "./get-tenants";
import type { Tenant } from "../model/tenant.types";

vi.mock("../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const tenants: Tenant[] = [
  {
    id: "tenant-1",
    realm: "tenant-01",
    name: "Tenant 1",
    short: "T1",
    parent_id: null,
    children: [],
  },
];

describe("getTenants", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(tenants);
  });

  it("requests hierarchical tenants without tenant scope", async () => {
    await expect(getTenants()).resolves.toEqual(tenants);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/tenants?hierarchical=true",
      { signal: undefined },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getTenants(signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/tenants?hierarchical=true",
      { signal },
    );
  });
});
