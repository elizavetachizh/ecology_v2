import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { counterpartyFixture } from "../model/counterparty.fixture";
import { CounterpartySelect } from "./CounterpartySelect";

vi.mock("../model/use-counterparties-query", () => ({
  useCounterpartiesOptions: () => ({
    options: [counterpartyFixture],
    loading: false,
    search: "",
    setSearch: vi.fn(),
    refetch: vi.fn(),
    refreshing: false,
    error: undefined,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: undefined }),
}));

describe("CounterpartySelect", () => {
  afterEach(cleanup);

  it("passes the selected counterparty so the form can copy address and contact", () => {
    const onChange = vi.fn();
    render(
      <CounterpartySelect tenantId="tenant-1" value="" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Контрагент" }));
    fireEvent.click(
      screen.getByRole("option", { name: "Ромашка (091234567)" }),
    );

    expect(onChange).toHaveBeenCalledWith("cp-1", counterpartyFixture);
  });

  it("passes null when the selection is cleared", () => {
    const onChange = vi.fn();
    render(
      <CounterpartySelect
        tenantId="tenant-1"
        value={counterpartyFixture.id}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Контрагент" }));
    fireEvent.click(screen.getByRole("button", { name: "Очистить выбор" }));

    expect(onChange).toHaveBeenCalledWith("", null);
  });
});
