import { describe, expect, it } from "vitest";
import { parseRealmHostMap, resolveRealm } from "./env";

describe("realm resolver", () => {
  it("uses the configured realm in development", () => {
    expect(
      resolveRealm({
        isDev: true,
        hostname: "localhost",
        developmentRealm: "tenant-01",
      }),
    ).toBe("tenant-01");
  });

  it("uses only an exact trusted production host mapping", () => {
    expect(
      resolveRealm({
        isDev: false,
        hostname: "tenant.example.com",
        developmentRealm: "ignored",
        hostMap: "tenant.example.com=tenant-01",
      }),
    ).toBe("tenant-01");

    expect(() =>
      resolveRealm({
        isDev: false,
        hostname: "evil.example.com",
        developmentRealm: "ignored",
        hostMap: "tenant.example.com=tenant-01",
      }),
    ).toThrow(/не настроено/);
  });

  it("supports trusted host and path mappings", () => {
    expect(
      resolveRealm({
        isDev: false,
        hostname: "app.example.com",
        pathname: "/t/tenant-01/dashboard",
        developmentRealm: "ignored",
        hostMap: "app.example.com/t/tenant-01=tenant-01",
      }),
    ).toBe("tenant-01");
  });

  it("rejects malformed mappings", () => {
    expect(() => parseRealmHostMap("tenant.example.com")).toThrow(/формат/);
  });
});
