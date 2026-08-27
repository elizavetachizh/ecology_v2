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
    localStorage.clear();
    sessionStorage.clear();
  });

  it("reads and writes tenant id scoped by realm", () => {
    writeActiveTenantId("mingas", "tenant-a");
    writeActiveTenantId("other", "tenant-b");

    expect(readActiveTenantId("mingas")).toBe("tenant-a");
    expect(readActiveTenantId("other")).toBe("tenant-b");
    expect(localStorage.getItem(activeTenantStorageKey("mingas"))).toBe(
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
    localStorage.setItem("unrelated", "keep");

    clearAllActiveTenantIds();

    expect(readActiveTenantId("mingas")).toBeNull();
    expect(readActiveTenantId("other")).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe("keep");
  });

  it("treats blank stored value as missing", () => {
    localStorage.setItem(activeTenantStorageKey("mingas"), "  ");
    expect(readActiveTenantId("mingas")).toBeNull();
  });

  it("migrates a sessionStorage value into localStorage once", () => {
    sessionStorage.setItem(activeTenantStorageKey("mingas"), "tenant-a");

    expect(readActiveTenantId("mingas")).toBe("tenant-a");
    expect(localStorage.getItem(activeTenantStorageKey("mingas"))).toBe(
      "tenant-a",
    );
    expect(sessionStorage.getItem(activeTenantStorageKey("mingas"))).toBeNull();
  });
});
