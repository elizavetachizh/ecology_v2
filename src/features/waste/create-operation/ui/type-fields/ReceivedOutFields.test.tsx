import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEmptyOperationFormValues,
  type OperationFormValues,
} from "../../model/operation-form.schema";
import { ReceivedOutFields } from "./ReceivedOutFields";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...rest }: { children: ReactNode }) => (
    <a {...rest}>{children}</a>
  ),
}));

vi.mock("../../../../../entities/tenant", () => ({
  useTenant: () => ({ activeTenantId: "tenant-1" }),
}));

vi.mock("../../../../../entities/waste/counterparties", () => ({
  CounterpartySelect: () => <div>Контрагент</div>,
}));

function renderFields() {
  function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm<OperationFormValues>({
      defaultValues: {
        ...createEmptyOperationFormValues(),
        operation_type: "received_out",
      },
    });
    return <FormProvider {...form}>{children}</FormProvider>;
  }

  return render(<ReceivedOutFields pending={false} tenantId="tenant-1" />, {
    wrapper: Wrapper,
  });
}

afterEach(cleanup);

describe("ReceivedOutFields", () => {
  it("renders the import switch off by default", () => {
    renderFields();

    const toggle = screen.getByRole("switch", { name: "По импорту" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByText(/поступило… из них по импорту/),
    ).toBeInTheDocument();
  });

  it("toggles is_import", () => {
    renderFields();

    const toggle = screen.getByRole("switch", { name: "По импорту" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });
});
