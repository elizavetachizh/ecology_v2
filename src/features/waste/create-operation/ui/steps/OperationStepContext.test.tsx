import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEmptyOperationFormValues,
  type OperationFormValues,
} from "../../model/operation-form.schema";
import { OperationStepContext } from "./OperationStepContext";

vi.mock("./OperationStepDate", () => ({
  OperationStepDate: () => <div>date-field</div>,
}));

vi.mock("./OperationStepUnit", () => ({
  OperationStepUnit: () => <div>unit-field</div>,
}));

vi.mock("./OperationStepBinding", () => ({
  OperationStepBinding: () => <div>binding-fields</div>,
}));

function renderStep(unitId = "") {
  function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm<OperationFormValues>({
      defaultValues: {
        ...createEmptyOperationFormValues(),
        unit_id: unitId,
      },
    });
    return <FormProvider {...form}>{children}</FormProvider>;
  }

  return render(<OperationStepContext pending={false} />, {
    wrapper: Wrapper,
  });
}

afterEach(cleanup);

describe("OperationStepContext", () => {
  it("shows date and unit, and waits for a unit before binding fields", () => {
    renderStep();

    expect(screen.getByText("date-field")).toBeInTheDocument();
    expect(screen.getByText("unit-field")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Выберите место учёта, чтобы указать инструкцию и отход.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("binding-fields")).not.toBeInTheDocument();
  });

  it("shows instruction and waste after a unit is selected", () => {
    renderStep("unit-1");

    expect(screen.getByText("binding-fields")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Выберите место учёта, чтобы указать инструкцию и отход.",
      ),
    ).not.toBeInTheDocument();
  });
});
