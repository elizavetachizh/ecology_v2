import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContractForm } from "./ContractForm";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

vi.mock("../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: "tenant-1" }),
}));

vi.mock("../../../../entities/waste/counterparties", () => ({
  CounterpartySelect: () => <div>Контрагент</div>,
  counterpartiesQueryKeys: {
    detail: () => ["counterparty"],
  },
  getCounterparty: vi.fn(),
}));

vi.mock("../../upsert-counterparty", () => ({
  CounterpartyFormModal: () => null,
}));

vi.mock("./ContractWastesEditor", () => ({
  ContractWastesEditor: () => <div>Перечень отходов</div>,
}));

vi.mock("../../../../entities/waste/wastes", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../entities/waste/wastes")>();
  return {
    ...actual,
    useWastesOptions: () => ({
      options: [],
      loading: false,
      search: "",
      setSearch: vi.fn(),
      refetch: vi.fn(),
      refreshing: false,
      error: undefined,
    }),
  };
});

function renderForm() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <ContractForm mode="create" onSaved={vi.fn()} onCancel={vi.fn()} />
    </QueryClientProvider>,
  );
}

function purposeSelect() {
  return screen.getByLabelText(/Цель передачи/);
}

function ownershipSwitch() {
  return screen.getByRole("switch", {
    name: "С передачей права собственности",
  });
}

afterEach(cleanup);

describe("ContractForm facility type", () => {
  it("locks ownership until the purpose is storage or disposal", () => {
    renderForm();

    expect(ownershipSwitch()).toBeDisabled();
    expect(ownershipSwitch()).toHaveAttribute("data-state", "checked");
    expect(
      screen.getByText("Отходы передаются с переходом права собственности."),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Тип объекта хранения/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Тип объекта захоронения/),
    ).not.toBeInTheDocument();
  });

  it("shows the storage facility select only when ownership is off", () => {
    renderForm();

    fireEvent.change(purposeSelect(), { target: { value: "storage" } });

    expect(ownershipSwitch()).toBeEnabled();
    expect(
      screen.queryByLabelText(/Тип объекта хранения/),
    ).not.toBeInTheDocument();

    fireEvent.click(ownershipSwitch());

    const facility = screen.getByLabelText(/Тип объекта хранения/);
    expect(
      screen
        .getByText("Тип объекта хранения", { selector: "label", exact: false })
        .querySelector("[aria-hidden]"),
    ).toHaveTextContent("*");
    expect(
      screen.getByRole("option", { name: "Выберите тип объекта" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Подземный резервуар" }),
    ).toHaveAttribute("value", "undeground_tank");

    fireEvent.change(facility, { target: { value: "sludge" } });
    fireEvent.click(ownershipSwitch());

    expect(
      screen.queryByLabelText(/Тип объекта хранения/),
    ).not.toBeInTheDocument();

    fireEvent.click(ownershipSwitch());
    expect(screen.getByLabelText(/Тип объекта хранения/)).toHaveValue("");
  });

  it("clears the facility type that no longer matches the purpose", () => {
    renderForm();

    fireEvent.change(purposeSelect(), { target: { value: "storage" } });
    fireEvent.click(ownershipSwitch());
    fireEvent.change(screen.getByLabelText(/Тип объекта хранения/), {
      target: { value: "dump" },
    });

    fireEvent.change(purposeSelect(), { target: { value: "disposal" } });

    const disposal = screen.getByLabelText(/Тип объекта захоронения/);
    expect(
      screen
        .getByText("Тип объекта захоронения", {
          selector: "label",
          exact: false,
        })
        .querySelector("[aria-hidden]"),
    ).toHaveTextContent("*");
    expect(disposal).toHaveValue("");
    expect(
      screen.getByRole("option", {
        name: "Полигон твёрдых коммунальных отходов",
      }),
    ).toHaveAttribute("value", "landfill_msw");
    expect(
      screen.queryByLabelText(/Тип объекта хранения/),
    ).not.toBeInTheDocument();

    fireEvent.change(disposal, { target: { value: "landfill_industrial" } });
    fireEvent.change(purposeSelect(), { target: { value: "storage" } });

    expect(screen.getByLabelText(/Тип объекта хранения/)).toHaveValue("");
    expect(
      screen.queryByLabelText(/Тип объекта захоронения/),
    ).not.toBeInTheDocument();
  });

  it("forces ownership on and hides facility types for other purposes", () => {
    renderForm();

    fireEvent.change(purposeSelect(), { target: { value: "storage" } });
    fireEvent.click(ownershipSwitch());
    fireEvent.change(screen.getByLabelText(/Тип объекта хранения/), {
      target: { value: "temporary" },
    });

    fireEvent.change(purposeSelect(), { target: { value: "use" } });

    expect(ownershipSwitch()).toBeDisabled();
    expect(ownershipSwitch()).toHaveAttribute("data-state", "checked");
    expect(
      screen.getByText("Право собственности для этой цели всегда передаётся."),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Тип объекта хранения/),
    ).not.toBeInTheDocument();

    fireEvent.change(purposeSelect(), { target: { value: "storage" } });

    expect(ownershipSwitch()).toBeEnabled();
    expect(ownershipSwitch()).toHaveAttribute("data-state", "checked");
    expect(
      screen.queryByLabelText(/Тип объекта хранения/),
    ).not.toBeInTheDocument();
  });

  it("clears both facility types when the contract type becomes transport", () => {
    renderForm();

    fireEvent.change(purposeSelect(), { target: { value: "disposal" } });
    fireEvent.click(ownershipSwitch());
    fireEvent.change(screen.getByLabelText(/Тип объекта захоронения/), {
      target: { value: "other" },
    });

    fireEvent.change(screen.getByLabelText(/Тип договора/), {
      target: { value: "transport" },
    });

    expect(screen.queryByLabelText(/Цель передачи/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("switch", {
        name: "С передачей права собственности",
      }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Тип договора/), {
      target: { value: "recycling" },
    });

    expect(purposeSelect()).toHaveValue("");
    expect(ownershipSwitch()).toBeDisabled();
    expect(ownershipSwitch()).toHaveAttribute("data-state", "checked");
    expect(
      screen.queryByLabelText(/Тип объекта захоронения/),
    ).not.toBeInTheDocument();

    fireEvent.change(purposeSelect(), { target: { value: "storage" } });

    expect(ownershipSwitch()).toBeEnabled();
    expect(ownershipSwitch()).toHaveAttribute("data-state", "checked");
    expect(
      screen.queryByLabelText(/Тип объекта хранения/),
    ).not.toBeInTheDocument();
  });
});
