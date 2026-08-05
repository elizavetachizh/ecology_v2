import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";

const { client, initializeKeycloak } = vi.hoisted(() => ({
  client: {
    authenticated: true,
    token: "token",
    tokenParsed: {
      preferred_username: "testuser",
      realm_access: { roles: ["waste.read"] },
    },
    login: vi.fn().mockResolvedValue(undefined),
    updateToken: vi.fn().mockResolvedValue(false),
  },
  initializeKeycloak: vi.fn(),
}));

vi.mock("../../../shared/auth/keycloak", () => ({
  getKeycloak: () => client,
  initializeKeycloak,
  resetKeycloakInitialization: vi.fn(),
}));

describe("AuthProvider", () => {
  beforeEach(() => {
    initializeKeycloak.mockReset();
  });

  it("does not render protected content before initialization finishes", async () => {
    let resolveInit!: (authenticated: boolean) => void;
    initializeKeycloak.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveInit = resolve;
      }),
    );

    render(
      <AuthProvider onSessionInvalidated={vi.fn()}>
        <div>protected</div>
      </AuthProvider>,
    );

    expect(screen.queryByText("protected")).not.toBeInTheDocument();
    resolveInit(true);
    expect(await screen.findByText("protected")).toBeInTheDocument();
  });

  it("shows a recoverable error when initialization fails", async () => {
    initializeKeycloak.mockRejectedValue(new Error("Keycloak unavailable"));

    render(
      <AuthProvider onSessionInvalidated={vi.fn()}>
        <div>protected</div>
      </AuthProvider>,
    );

    expect(
      await screen.findByText("Не удалось выполнить вход"),
    ).toBeInTheDocument();
    expect(screen.getByText("Keycloak unavailable")).toBeInTheDocument();
  });
});
