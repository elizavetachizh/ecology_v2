import { beforeEach, describe, expect, it } from "vitest";
import {
  activeTenantStorageKey,
  clearActiveTenantId,
  clearAllActiveTenantIds,
  readActiveTenantId,
  writeActiveTenantId,
} from "./active-tenant-storage";

describe("active-tenant-storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("reads and writes tenant id scoped by realm", () => {
    writeActiveTenantId("mingas", "tenant-a");
    writeActiveTenantId("other", "tenant-b");

    expect(readActiveTenantId("mingas")).toBe("tenant-a");
    expect(readActiveTenantId("other")).toBe("tenant-b");
    expect(sessionStorage.getItem(activeTenantStorageKey("mingas"))).toBe(
      "tenant-a",
    );
  });

  it("clears one realm without touching another", () => {
    writeActiveTenantId("mingas", "tenant-a");
    writeActiveTenantId("other", "tenant-b");
    clearActiveTenantId("mingas");

    expect(readActiveTenantId("mingas")).toBeNull();
    expect(readActiveTenantId("other")).toBe("tenant-b");
  });

  it("clearAllActiveTenantIds removes only eco.activeTenantId.* keys", () => {
    writeActiveTenantId("mingas", "tenant-a");
    writeActiveTenantId("other", "tenant-b");
    sessionStorage.setItem("unrelated", "keep");

    clearAllActiveTenantIds();

    expect(readActiveTenantId("mingas")).toBeNull();
    expect(readActiveTenantId("other")).toBeNull();
    expect(sessionStorage.getItem("unrelated")).toBe("keep");
  });

  it("treats blank stored value as missing", () => {
    sessionStorage.setItem(activeTenantStorageKey("mingas"), "  ");
    expect(readActiveTenantId("mingas")).toBeNull();
  });
});
