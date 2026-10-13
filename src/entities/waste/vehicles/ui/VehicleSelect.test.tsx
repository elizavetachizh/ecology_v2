import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VehicleSelect } from "./VehicleSelect";

const { vehicle } = vi.hoisted(() => ({
  vehicle: {
    id: "vehicle-1",
    make: "МАЗ",
    model: "5551",
    license_plate: "1234 AB-7",
  },
}));

vi.mock("../model/use-vehicles-query", () => ({
  useVehiclesOptions: () => ({
    options: [vehicle],
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

describe("VehicleSelect", () => {
  afterEach(cleanup);

  it("reports the selected vehicle id", () => {
    const onChange = vi.fn();
    render(<VehicleSelect tenantId="tenant-1" value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Транспорт" }));
    fireEvent.click(
      screen.getByRole("option", { name: "МАЗ 5551 — 1234 AB-7" }),
    );

    expect(onChange).toHaveBeenCalledWith(vehicle.id);
  });

  it("clears the selection", () => {
    const onChange = vi.fn();
    render(
      <VehicleSelect
        tenantId="tenant-1"
        value={vehicle.id}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Транспорт" }));
    fireEvent.click(screen.getByRole("button", { name: "Очистить выбор" }));

    expect(onChange).toHaveBeenCalledWith("");
  });
});
