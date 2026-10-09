import type { ComponentProps, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVehicle,
  updateVehicle,
  vehiclesQueryKeys,
} from "../../../../entities/waste/vehicles";
import { vehicleFixture } from "../../../../entities/waste/vehicles/model/vehicle.fixture";
import { ApiError } from "../../../../shared/api/api-client";
import { queryClient } from "../../../../shared/lib/query-client";
import { VehicleForm } from "./VehicleForm";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("../../../../entities/waste/vehicles", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/vehicles")
    >();
  return {
    ...actual,
    createVehicle: vi.fn(),
    updateVehicle: vi.fn(),
  };
});

const createMock = vi.mocked(createVehicle);
const updateMock = vi.mocked(updateVehicle);

function renderForm(props: Partial<ComponentProps<typeof VehicleForm>> = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <VehicleForm
        mode="create"
        onSaved={vi.fn()}
        onCancel={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );
}

function fillRequired(values?: {
  make?: string;
  model?: string;
  plate?: string;
}) {
  fireEvent.change(screen.getByLabelText(/Марка/), {
    target: { value: values?.make ?? "МАЗ" },
  });
  fireEvent.change(screen.getByLabelText(/Модель/), {
    target: { value: values?.model ?? "5551" },
  });
  fireEvent.change(screen.getByLabelText(/Госномер/), {
    target: { value: values?.plate ?? "1234 AB-7" },
  });
}

beforeEach(() => {
  createMock.mockReset();
  updateMock.mockReset();
  createMock.mockResolvedValue(vehicleFixture);
  updateMock.mockResolvedValue(vehicleFixture);
  queryClient.clear();
  vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  queryClient.clear();
});

describe("VehicleForm", () => {
  it("creates a vehicle without weight and beltopgas id", async () => {
    const onSaved = vi.fn();
    renderForm({ onSaved });

    expect(
      screen.getByRole("heading", { name: "Новое транспортное средство" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Статус/)).toHaveValue("active");

    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(vehicleFixture, { close: false }),
    );
    expect(createMock).toHaveBeenCalledWith({
      make: "МАЗ",
      model: "5551",
      license_plate: "1234 AB-7",
      weight: null,
      status: "active",
      beltopgas_id: null,
    });
    expect(updateMock).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: vehiclesQueryKeys.lists(),
    });
  });

  it("shows a 409 conflict on the form", async () => {
    createMock.mockRejectedValue(
      new ApiError("Сервер вернул ошибку 409", 409, "http_error"),
    );
    const onSaved = vi.fn();
    renderForm({ onSaved });

    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));

    await waitFor(() =>
      expect(
        screen.getByText(
          "Транспорт с таким госномером или ID Белтопгаз уже есть.",
        ),
      ).toBeInTheDocument(),
    );
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("updates a vehicle and stores the response in the detail cache", async () => {
    const updated = { ...vehicleFixture, make: "КАМАЗ", model: "65115" };
    updateMock.mockResolvedValue(updated);
    const onSaved = vi.fn();
    renderForm({
      mode: "edit",
      vehicleId: vehicleFixture.id,
      initial: vehicleFixture,
      onSaved,
    });

    expect(
      screen.getByRole("heading", { name: "МАЗ 5551" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Масса")).toHaveValue("12000");
    expect(screen.getByLabelText("ID Белтопгаз")).toHaveValue("1001");

    fireEvent.change(screen.getByLabelText(/Марка/), {
      target: { value: "КАМАЗ" },
    });
    fireEvent.change(screen.getByLabelText(/Модель/), {
      target: { value: "65115" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Сохранить и закрыть" }),
    );

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(updated, { close: true }),
    );
    expect(updateMock).toHaveBeenCalledWith(vehicleFixture.id, {
      make: "КАМАЗ",
      model: "65115",
      license_plate: vehicleFixture.license_plate,
      weight: 12000,
      status: "active",
      beltopgas_id: 1001,
    });
    expect(createMock).not.toHaveBeenCalled();
    expect(
      queryClient.getQueryData(
        vehiclesQueryKeys.detail(updated.tenant_id, updated.id),
      ),
    ).toEqual(updated);
  });
});
