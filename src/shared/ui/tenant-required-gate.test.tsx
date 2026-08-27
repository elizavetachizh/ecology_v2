import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TenantRequiredGate } from "./tenant-required-gate";

afterEach(cleanup);

describe("TenantRequiredGate", () => {
  it("renders children when a tenant is selected", () => {
    render(
      <TenantRequiredGate tenantId="tenant-1">
        <p>Справочник</p>
      </TenantRequiredGate>,
    );

    expect(screen.getByText("Справочник")).toBeInTheDocument();
    expect(
      screen.queryByText("Выберите организацию"),
    ).not.toBeInTheDocument();
  });

  it("shows the default empty state without a tenant", () => {
    render(
      <TenantRequiredGate tenantId={null}>
        <p>Справочник</p>
      </TenantRequiredGate>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Выберите организацию")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Выберите организацию в верхней панели, чтобы продолжить.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Справочник")).not.toBeInTheDocument();
  });

  it("uses resourceLabel in the default description", () => {
    render(
      <TenantRequiredGate tenantId={undefined} resourceLabel="отходов">
        hidden
      </TenantRequiredGate>,
    );

    expect(
      screen.getByText(
        "Чтобы работать со справочником отходов, выберите организацию в верхней панели.",
      ),
    ).toBeInTheDocument();
  });

  it("lets description and title override the defaults", () => {
    render(
      <TenantRequiredGate
        tenantId={null}
        resourceLabel="отходов"
        title="Нет доступа"
        description="Сначала выберите организацию."
      >
        hidden
      </TenantRequiredGate>,
    );

    expect(screen.getByText("Нет доступа")).toBeInTheDocument();
    expect(
      screen.getByText("Сначала выберите организацию."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/справочником отходов/)).not.toBeInTheDocument();
  });
});
