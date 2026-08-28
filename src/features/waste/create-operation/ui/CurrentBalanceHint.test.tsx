import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCurrentBalanceQuery } from "../../../../entities/waste/operations";
import { CurrentBalanceHint } from "./CurrentBalanceHint";

vi.mock("../../../../entities/waste/operations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/operations")
    >();
  return {
    ...actual,
    useCurrentBalanceQuery: vi.fn(),
  };
});

const useCurrentBalanceQueryMock = vi.mocked(useCurrentBalanceQuery);

afterEach(() => {
  cleanup();
  useCurrentBalanceQueryMock.mockReset();
});

describe("CurrentBalanceHint", () => {
  it("shows current balance and orange fill below 85%", () => {
    useCurrentBalanceQueryMock.mockReturnValue({
      balance: { unit_id: "unit-1", waste_id: "waste-1", amount: "10" },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <CurrentBalanceHint
        tenantId="tenant-1"
        unitId="unit-1"
        wasteId="waste-1"
        uomLabel="т"
        transportUnit="20"
      />,
    );

    expect(screen.getByText("Текущий остаток: 10 т")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar", {
      name: "Заполненность 50 процентов",
    });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar.firstElementChild).toHaveClass("bg-warning");
  });

  it("shows a red fill bar above 85%", () => {
    useCurrentBalanceQueryMock.mockReturnValue({
      balance: { unit_id: "unit-1", waste_id: "waste-1", amount: "18" },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <CurrentBalanceHint
        tenantId="tenant-1"
        unitId="unit-1"
        wasteId="waste-1"
        transportUnit="20"
      />,
    );

    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Заполненность 90 процентов" })
        .firstElementChild,
    ).toHaveClass("bg-destructive");
  });

  it("hides fill when transport_unit is zero", () => {
    useCurrentBalanceQueryMock.mockReturnValue({
      balance: { unit_id: "unit-1", waste_id: "waste-1", amount: "10" },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <CurrentBalanceHint
        tenantId="tenant-1"
        unitId="unit-1"
        wasteId="waste-1"
        transportUnit="0"
      />,
    );

    expect(screen.getByText("Текущий остаток: 10")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
